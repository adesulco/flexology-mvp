"use server";
import { sanitizeText } from "@/lib/sanitize";


import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getTenant } from "@/lib/tenant";

export async function createPosBooking(formData: FormData) {
  const session = await getSession();
  if (!session || !['OUTLET_ADMIN', 'OUTLET_MANAGER', 'SUPER_ADMIN'].includes(session.role as string)) {
    throw new Error("Unauthorized POS access");
  }

  const customerId = formData.get("customerId") as string;
  const guestName = sanitizeText(formData.get("guestName") as string);
  const guestPhone = sanitizeText(formData.get("guestPhone") as string);
  
  const serviceId = formData.get("serviceId") as string;
  const flexologistId = formData.get("flexologistId") as string;
  const scheduledDate = sanitizeText(formData.get("scheduledDate") as string);
  const locationId = formData.get("locationId") as string || session.managedLocationId as string;

  if (!serviceId || !scheduledDate || !locationId) {
    throw new Error("Missing required booking fields (service/date/location)");
  }

  const tenant = await getTenant();
  let targetUserId = customerId;

  // 1. Resolve Customer ID (Search or Quick Register)
  if (!targetUserId) {
     if (!guestName || !guestPhone) throw new Error("Must provide customer assignment or guest registration details");
     
     const existingByPhone = await prisma.user.findUnique({ where: { phoneNumber: guestPhone } });
     if (existingByPhone) {
        targetUserId = existingByPhone.id;
     } else {
        // Quick POS Guest Registration
        const newUser = await prisma.user.create({
           data: {
              name: guestName,
              phoneNumber: guestPhone,
              role: "CLIENT"
           }
        });
        targetUserId = newUser.id;
     }
  }

  // 2. Validate Service and Pricing
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) throw new Error("Invalid service");

  // 3. Create the Booking with 'pos' source directly
  const booking = await prisma.booking.create({
     data: {
        userId: targetUserId,
        serviceId: service.id,
        locationId,
        flexologistId: flexologistId === 'any' ? null : flexologistId,
        mode: "OUTLET",
        status: "CONFIRMED", // Walk-in is instantly confirmed for POS
        scheduledDate: new Date(scheduledDate),
        totalPrice: service.price,
        source: "pos",
        tenantId: tenant?.id,
        isPaid: false // Must be settled via POS Checkout
     }
  });

  revalidatePath("/pos/schedule");
  return { success: true, bookingId: booking.id };
}

export async function searchPosCustomer(query: string) {
   const session = await getSession();
   if (!session || !['OUTLET_ADMIN', 'OUTLET_MANAGER', 'SUPER_ADMIN'].includes(session.role as string)) {
     throw new Error("Unauthorized");
   }

   if (!query || query.length < 3) return [];

   return await prisma.user.findMany({
      where: {
         OR: [
            { name: { contains: query, mode: "insensitive" } },
            { phoneNumber: { contains: query } },
            { email: { contains: query, mode: "insensitive" } }
         ],
         role: "CLIENT"
      },
      take: 5,
      select: { id: true, name: true, phoneNumber: true, email: true, tier: true }
   });
}
