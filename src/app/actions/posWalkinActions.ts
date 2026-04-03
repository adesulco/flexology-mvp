"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addWalkIn(formData: FormData) {
   const session = await getSession();
   if (!session || !['OUTLET_ADMIN', 'OUTLET_MANAGER', 'SUPER_ADMIN'].includes(session.role as string)) throw new Error("Unauthorized");

   const outletId = session.managedLocationId as string;
   if (!outletId) throw new Error("Require specific outlet context.");

   const customerName = formData.get("customerName") as string;
   const customerPhone = formData.get("customerPhone") as string;
   const serviceId = formData.get("serviceId") as string;
   
   if (!customerName) throw new Error("Name is required");

   await prisma.walkInQueue.create({
      data: {
         outletId,
         customerName,
         customerPhone,
         serviceRequested: serviceId || null,
         status: "waiting"
      }
   });

   revalidatePath("/pos/walk-ins");
   return { success: true };
}

export async function assignWalkInToBooking(walkInId: string, flexologistId: string, timeAssigned: string) {
   const session = await getSession();
   if (!session || !['OUTLET_ADMIN', 'OUTLET_MANAGER', 'SUPER_ADMIN'].includes(session.role as string)) throw new Error("Unauthorized");

   const walkIn = await prisma.walkInQueue.findUnique({ where: { id: walkInId } });
   if (!walkIn || walkIn.status !== "waiting") throw new Error("Invalid Walk In");

   let targetUserId = "pending";
   
   // Check if user exists by phone
   if (walkIn.customerPhone) {
      const u = await prisma.user.findUnique({ where: { phoneNumber: walkIn.customerPhone }});
      if (u) { targetUserId = u.id; }
      else {
         const newU = await prisma.user.create({ data: { name: walkIn.customerName, phoneNumber: walkIn.customerPhone, role: "CLIENT" } });
         targetUserId = newU.id;
      }
   } else {
      const newU = await prisma.user.create({ data: { name: walkIn.customerName, role: "CLIENT" } });
      targetUserId = newU.id;
   }

   const service = await prisma.service.findUnique({ where: { id: walkIn.serviceRequested! }});

   const booking = await prisma.booking.create({
      data: {
         userId: targetUserId,
         serviceId: walkIn.serviceRequested!,
         locationId: walkIn.outletId,
         flexologistId: flexologistId || null,
         mode: "OUTLET",
         status: "CONFIRMED",
         scheduledDate: new Date(timeAssigned),
         totalPrice: service?.price || 0,
         source: "pos",
         isPaid: false
      }
   });

   await prisma.walkInQueue.update({
      where: { id: walkInId },
      data: { status: "assigned", assignedStaffId: flexologistId }
   });

   revalidatePath("/pos/walk-ins");
   return { success: true, bookingId: booking.id };
}

export async function cancelWalkIn(walkInId: string) {
   const session = await getSession();
   if (!session || !['OUTLET_ADMIN', 'OUTLET_MANAGER', 'SUPER_ADMIN'].includes(session.role as string)) throw new Error("Unauthorized");

   await prisma.walkInQueue.update({
      where: { id: walkInId },
      data: { status: "cancelled" }
   });

   revalidatePath("/pos/walk-ins");
}
