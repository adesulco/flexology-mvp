import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { getTenant } from '@/lib/tenant';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tenant = await getTenant();
    const body = await req.json();
    const { itemId, type, subtotal, platformFee, totalAmount, methodKey } = body;

    // Validate request
    if (!totalAmount || !itemId || !type) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // 1. Log transaction securely into our system as PENDING provider: XENDIT
    const transaction = await prisma.paymentTransaction.create({
      data: {
        userId: session.userId as string,
        tenantId: tenant?.id,
        subtotal,
        platformFee,
        totalAmount,
        method: methodKey,
        provider: "XENDIT",
        type,
        bookingId: type === 'BOOKING' ? itemId : undefined,
        targetTier: type === 'SUBSCRIPTION' ? itemId : undefined,
        status: "PENDING"
      }
    });

    // 2. Generate secure payment URL (Simulated Xendit Node SDK response)
    // Since we do not have a live XENDIT_SECRET_KEY in production right now, we will mock the redirect.
    // In production, this would do an axios POST to https://api.xendit.co/v2/invoices
    
    // Fallback Mock URL that passes the tracking ID
    const xenditCheckoutUrl = `/checkout/success?ref=${transaction.id}&provider=XENDIT`;

    return NextResponse.json({ 
       invoiceUrl: xenditCheckoutUrl,
       transactionId: transaction.id
    });

  } catch (err: any) {
    console.error("XENDIT GEN ERROR:", err);
    return NextResponse.json({ error: "Failed to generate Xendit payment link", details: err.message }, { status: 500 });
  }
}
