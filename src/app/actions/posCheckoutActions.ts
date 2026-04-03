"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const midtransClient = require('midtrans-client');

export async function processPosManualCheckout(formData: FormData) {
   const session = await getSession();
   if (!session || !['OUTLET_ADMIN', 'OUTLET_MANAGER', 'SUPER_ADMIN'].includes(session.role as string)) {
      throw new Error("Unauthorized");
   }

   const bookingId = formData.get("bookingId") as string;
   const paymentMethod = formData.get("paymentMethod") as string || "CASH";
   const tenderedAmount = parseInt(formData.get("tenderedAmount") as string || "0", 10);
   
   if (!bookingId) throw new Error("Invalid parameters");

   const booking = await prisma.booking.findUnique({ where: { id: bookingId }});
   if (!booking || booking.isPaid) throw new Error("Invalid booking or already paid");

   if (paymentMethod === "CASH" && tenderedAmount < booking.totalPrice) {
      throw new Error("Tendered amount is less than total price.");
   }

   // Record POS Transaction
   const posTrans = await prisma.posTransaction.create({
      data: {
         bookingId: booking.id,
         outletId: booking.locationId || session.managedLocationId as string,
         adminId: session.userId as string,
         subtotal: booking.totalPrice,
         total: booking.totalPrice,
         paymentMethod: paymentMethod,
         paymentStatus: "completed"
      }
   });

   // Settle Booking
   await prisma.booking.update({
      where: { id: booking.id },
      data: { isPaid: true }
   });

   revalidatePath("/pos/checkout");
   return { success: true, changeDue: paymentMethod === "CASH" ? (tenderedAmount - booking.totalPrice) : 0 };
}

export async function processPosDigitalCheckout(bookingId: string) {
   const session = await getSession();
   if (!session || !['OUTLET_ADMIN', 'OUTLET_MANAGER', 'SUPER_ADMIN'].includes(session.role as string)) {
      throw new Error("Unauthorized");
   }

   const booking = await prisma.booking.findUnique({ 
      where: { id: bookingId },
      include: { user: true }
   });
   
   if (!booking || booking.isPaid) throw new Error("Invalid booking or already paid");

   const snap = new midtransClient.Snap({
       isProduction: false,
       serverKey: process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-DUMMY",
       clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-DUMMY"
   });

   // Create Pending POS Transaction initially
   const posTrans = await prisma.posTransaction.create({
      data: {
         bookingId: booking.id,
         outletId: booking.locationId || session.managedLocationId as string,
         adminId: session.userId as string,
         subtotal: booking.totalPrice,
         total: booking.totalPrice,
         paymentMethod: "DIGITAL_GATEWAY",
         paymentStatus: "pending"
      }
   });

   const parameter = {
      transaction_details: {
          order_id: posTrans.id, // We use posTrans ID for Midtrans to track the Ledger
          gross_amount: booking.totalPrice
      },
      customer_details: {
          first_name: booking.user.name,
          phone: booking.user.phoneNumber,
          email: booking.user.email || "guest@flexology.local"
      }
   };

   let token = "";
   try {
       token = await snap.createTransactionToken(parameter);
   } catch(e: any) {
       // Dev Bypass Fallback just in case keys are strictly empty
       if (e.message?.includes("SB-Mid-server-DUMMY") || e.message?.includes("401")) {
          return { devBypass: true, transactionId: posTrans.id };
       }
       throw new Error(`Midtrans generated error: ${e.message}`);
   }

   return { token, transactionId: posTrans.id };
}

export async function completeDigitalPosCheckout(transactionId: string) {
   const session = await getSession();
   if (!session || !['OUTLET_ADMIN', 'OUTLET_MANAGER', 'SUPER_ADMIN'].includes(session.role as string)) throw new Error("Unauthorized");

   const posTrans = await prisma.posTransaction.findUnique({ where: { id: transactionId } });
   if (!posTrans || !posTrans.bookingId) throw new Error("Invalid tx");

   await prisma.posTransaction.update({
      where: { id: transactionId },
      data: { paymentStatus: "completed" }
   });

   await prisma.booking.update({
      where: { id: posTrans.bookingId },
      data: { isPaid: true }
   });

   revalidatePath("/pos/checkout");
   return { success: true };
}
