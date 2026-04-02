import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
const midtransClient = require('midtrans-client');

export async function POST(req: Request) {
   try {
      const session = await getSession();
      if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { itemId, type, subtotal, platformFee, totalAmount, methodKey, devBypass } = await req.json();

      // Ensure the Math Adds Up
      if (subtotal + platformFee !== totalAmount) {
         return NextResponse.json({ error: "Mathematical check failed. Unauthorized surcharge injection." }, { status: 400 });
      }

      // Pre-Auth Checks based on Type
      if (type === "BOOKING") {
         const validation = await prisma.booking.findUnique({ where: { id: itemId, userId: session.userId as string } });
         if (!validation || validation.isPaid) return NextResponse.json({ error: "Booking invalid or already paid." }, { status: 400 });
         if (validation.totalPrice !== subtotal) return NextResponse.json({ error: "Base subtotal mismatch." }, { status: 400 });
      } else if (type === "SUBSCRIPTION") {
         const validation = await prisma.membershipTier.findUnique({ where: { rank: itemId as any } });
         if (!validation) return NextResponse.json({ error: "Invalid Tier" }, { status: 400 });
         if (validation.price !== subtotal) return NextResponse.json({ error: "Base subtotal mismatch." }, { status: 400 });
      } else {
         return NextResponse.json({ error: "Invalid payment intent type" }, { status: 400 });
      }

      // Initialize Core Midtrans Dependency
      // Failsafe keys for the prototype MVP if ENV is absent
      const snap = new midtransClient.Snap({
          isProduction: false,
          serverKey: process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-DUMMY",
          clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-DUMMY"
      });

      // Register Ledger Transaction
      const ledgerEntry = await prisma.paymentTransaction.create({
         data: {
            userId: session.userId as string,
            subtotal,
            platformFee,
            totalAmount,
            method: methodKey,
            type,
            bookingId: type === "BOOKING" ? itemId : null,
            targetTier: type === "SUBSCRIPTION" ? itemId as any : null,
         }
      });

      const user = await prisma.user.findUnique({ where: { id: session.userId as string }});

      // Developer Bypass: Skip Midtrans entirely and mark as paid
      if (devBypass) {
         await prisma.paymentTransaction.update({
            where: { id: ledgerEntry.id },
            data: { status: "SUCCESS", paidAt: new Date() }
         });
         
         if (type === "BOOKING") {
             await prisma.booking.update({ where: { id: itemId }, data: { isPaid: true } });
         } else if (type === "SUBSCRIPTION") {
             await prisma.user.update({ where: { id: session.userId as string }, data: { tier: itemId as any } });
         }

         return NextResponse.json({ token: "bypass_token", orderId: ledgerEntry.id });
      }

      // Midtrans Enabled Payments Mapping
      let enabled_payments: string[] = [];
      if (methodKey === "QRIS") enabled_payments = ["gopay", "shopeepay", "qris", "other_qris"];
      if (methodKey === "VA") enabled_payments = ["bca_va", "bni_va", "bri_va", "echannel", "permata_va", "other_va"];
      if (methodKey === "CC") enabled_payments = ["credit_card"];

      // Compile Secure Gateway Payload
      const parameters = {
          transaction_details: {
              order_id: ledgerEntry.id, // Immutable UUID tracked in PostgreSQL
              gross_amount: totalAmount
          },
          customer_details: {
              first_name: user?.name,
              email: user?.email || "no-reply@flexology.test",
              phone: user?.phoneNumber || "080000000000"
          },
          item_details: [
            { id: itemId, price: subtotal, quantity: 1, name: type === "BOOKING" ? "Assisted Flexology Booking" : "Membership Tier Subscription" },
            { id: "platform_fee", price: platformFee, quantity: 1, name: `Platform Surcharge (${methodKey})` }
          ],
          enabled_payments,
          callbacks: {
             // In local dev, midtrans redirects to this if completed on popup context
             finish: "https://flexology.vercel.app/profile"
          }
      };

      const transaction = await snap.createTransaction(parameters);
      return NextResponse.json({ token: transaction.token, orderId: ledgerEntry.id });

   } catch (err: any) {
      console.error("SNAP ENGINE ERROR:", err);
      return NextResponse.json({ error: err.message }, { status: 500 });
   }
}
