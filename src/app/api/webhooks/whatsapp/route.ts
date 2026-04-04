import { formatRupiah, formatRate } from "@/lib/format";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Phase 7: Webhook Challenge Verification (Meta Cloud API Requirement)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'JEMARI_SAAS_SECRET_TOKEN';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse('Forbidden', { status: 403 });
  }
}

// Phase 7: WhatsApp Chatbot Receiver Engine
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verify it's a WhatsApp Business Account message payload
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.value && change.value.messages) {
             const message = change.value.messages[0];
             const senderPhone = message.from; // e.g., '62812345678'
             
             // In rare cases of unsupported message types (images, buttons), gracefully ignore
             if (message.type !== 'text') continue;
             
             const textCommand = message.text.body.trim().toUpperCase();
             
             // 1. Resolve User securely via Phone Number matching
             const user = await prisma.user.findFirst({
                 where: {
                     phoneNumber: {
                         endsWith: senderPhone.length > 10 ? senderPhone.slice(-10) : senderPhone
                     }
                 }
             });

             let replyText = "Welcome to Jemari! We couldn't find your account. Please create one at https://jemariapp.com to start booking your recovery sessions.";

             // 2. Execute NLP Routine if User found
             if (user) {
                if (textCommand.includes("BOOK")) {
                   replyText = `Hi ${user.name.split(' ')[0]}! Ready for a session? Fast-track your booking here: https://jemariapp.com/book?phone=${user.phoneNumber}`;
                } else if (textCommand.includes("POINTS") || textCommand.includes("REWARDS")) {
                   replyText = `You currently have ${formatRate(user.points)} FLX Points safely vaulted. You are on the ${user.tier.replace('_', ' ')} tier!`;
                } else if (textCommand.includes("CANCEL")) {
                   // Attempt auto-cancel of newest PENDING booking
                   const latestBooking = await prisma.booking.findFirst({
                       where: { userId: user.id, status: 'PENDING' },
                       orderBy: { createdAt: 'desc' }
                   });
                   if (latestBooking) {
                       await prisma.booking.update({ where: { id: latestBooking.id }, data: { status: 'CANCELLED' } });
                       replyText = `Your pending booking on ${latestBooking.scheduledDate.toLocaleDateString()} has been officially cancelled via WhatsApp.`;
                   } else {
                       replyText = `You have no pending bookings to cancel.`;
                   }
                } else {
                   // Fallback Main Menu
                   replyText = `Hello ${user.name}! I am your automated SaaS Concierge. \n\nReply with:\n- *BOOK* to make a new reservation\n- *POINTS* to check your balance\n- *CANCEL* to void your last pending booking`;
                }
             }

             // 3. Dispatch Response string to Meta Cloud API securely
             // (Simulated Axios Call for Production Integration)
             if (process.env.WHATSAPP_API_TOKEN) {
                 await fetch(`https://graph.facebook.com/v17.0/${change.value.metadata.phone_number_id}/messages`, {
                     method: 'POST',
                     headers: {
                         'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
                         'Content-Type': 'application/json'
                     },
                     body: JSON.stringify({
                         messaging_product: 'whatsapp',
                         to: senderPhone,
                         type: 'text',
                         text: { body: replyText }
                     })
                 });
             } else {
                 // In Dev Mode, echo to terminal
                 console.log(`[WHATSAPP BOT] Simulated sent to ${senderPhone}: ${replyText}`);
             }
          }
        }
      }
      return NextResponse.json({ status: 'success' }, { status: 200 });
    } else {
      return NextResponse.json({ status: 'ignored' }, { status: 404 });
    }
  } catch (error) {
    console.error('WhatsApp Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
