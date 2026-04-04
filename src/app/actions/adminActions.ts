"use server";
import { sanitizeText } from "@/lib/sanitize";


import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/auth"
import { processBookingGamification } from "@/lib/gamification"
import bcrypt from "bcryptjs"
import { getTenant } from "@/lib/tenant"

export async function createFlexologist(formData: FormData) {
  const session = await getSession()
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'OUTLET_MANAGER' && session.role !== 'GLOBAL_MANAGER')) {
    throw new Error("Unauthorized");
  }

  const rawName = sanitizeText(formData.get("name") as string)
  const name = rawName.trim().replace(/\b\w/g, c => c.toUpperCase())
  const specialty = sanitizeText(formData.get("specialty") as string)
  let locationId = formData.get("locationId") as string
  const canHomeService = formData.get("canHomeService") === "on"
  const shiftStart = sanitizeText(formData.get("shiftStart") as string) || "09:00"
  const shiftEnd = sanitizeText(formData.get("shiftEnd") as string) || "20:00"

  if (session.role === 'OUTLET_MANAGER') {
     if (!session.managedLocationId) throw new Error("Manager lacks a designated outlet");
     locationId = session.managedLocationId as string;
  }

  if (!name || !specialty) throw new Error("Missing required fields")

  const tenant = await getTenant()

  await prisma.flexologist.create({
    data: {
       name,
       bio: specialty,
       locationId: locationId || null,
       tenantId: tenant?.id,
       canHomeService,
       rating: 5.0,
       shiftStart,
       shiftEnd,
       isOnDuty: true
    }
  })

  console.info(`[AUDIT LOG] ${session.email} created Flexologist <${name}> for Outlet: ${locationId || 'Global'}`);
  revalidatePath("/admin/staff")
}

export async function toggleFlexologistDuty(formData: FormData) {
   const session = await getSession();
   if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'OUTLET_MANAGER' && session.role !== 'GLOBAL_MANAGER')) throw new Error("Unauthorized");
   
   const flexId = formData.get("flexId") as string;
   const isOnDuty = formData.get("isOnDuty") === "true";
   
   await prisma.flexologist.update({
      where: { id: flexId },
      data: { isOnDuty }
   });
   console.info(`[AUDIT LOG] ${session.email} toggled Flexologist ${flexId} duty state to: ${isOnDuty}`);
   revalidatePath("/admin/staff");
}

export async function updateBookingStatus(bookingId: string, status: string, assignedFlexologistId?: string) {
  const session = await getSession()
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'OUTLET_MANAGER' && session.role !== 'GLOBAL_MANAGER')) throw new Error("Unauthorized")

  if (!bookingId || !status) return { error: "Invalid payload" }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
       status: status as any,
       ...(assignedFlexologistId ? { flexologistId: assignedFlexologistId } : {})
    }
  })

  // Engine: Advanced Gamification Evaluation (Tiers, Multipliers, Streaks, Badges, Mystery Boxes)
  if (updatedBooking.status === "COMPLETED" && !updatedBooking.pointsAwarded) {
     try {
       await processBookingGamification(updatedBooking.userId, bookingId);
     } catch (err) {
       console.error("Gamification Engine Failed:", err);
     }
  }

  revalidatePath("/admin")
  return { success: true }
}

export async function adjustBooking(formData: FormData) {
  const session = await getSession()
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'OUTLET_MANAGER' && session.role !== 'GLOBAL_MANAGER')) throw new Error("Unauthorized");

  const bookingId = formData.get("bookingId") as string;
  const scheduledDateStr = sanitizeText(formData.get("scheduledDate") as string);
  const totalPrice = parseInt(sanitizeText(formData.get("totalPrice") as string));
  const flexologistId = formData.get("flexologistId") as string;
  const status = formData.get("status") as any;
  const homeAddress = sanitizeText(formData.get("homeAddress") as string);

  if (!bookingId) throw new Error("Missing ID");

  const updatedBooking = await prisma.booking.update({
     where: { id: bookingId },
     data: {
        scheduledDate: new Date(scheduledDateStr),
        totalPrice,
        status,
        flexologistId: flexologistId || null,
        homeAddress: homeAddress || null
     }
  });

  // Engine: Advanced Gamification Evaluation (Tiers, Multipliers, Streaks, Badges, Mystery Boxes)
  if (updatedBooking.status === "COMPLETED" && !updatedBooking.pointsAwarded) {
     try {
       await processBookingGamification(updatedBooking.userId, bookingId);
     } catch (err) {
       console.error("Gamification Engine Failed:", err);
     }
  }

  revalidatePath("/admin");
}

export async function voidBooking(formData: FormData) {
  const session = await getSession()
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'OUTLET_MANAGER' && session.role !== 'GLOBAL_MANAGER')) throw new Error("Unauthorized");

  const bookingId = formData.get("bookingId") as string;
  
  await prisma.booking.delete({
     where: { id: bookingId }
  });

  revalidatePath("/admin");
}

// ==== OUTLET MANAGEMENT ====

export async function createLocation(formData: FormData) {
  const session = await getSession()
  if (session?.role !== 'SUPER_ADMIN' && session?.role !== 'GLOBAL_MANAGER') throw new Error("Unauthorized");

  const name = sanitizeText(formData.get("name") as string);
  const address = sanitizeText(formData.get("address") as string);
  const mapLink = sanitizeText(formData.get("mapLink") as string);
  const openTime = sanitizeText(formData.get("openTime") as string) || "08:00";
  const closeTime = sanitizeText(formData.get("closeTime") as string) || "22:00";

  if (!name || !address) throw new Error("Missing required fields");

  const tenant = await getTenant()

  await prisma.location.create({
    data: {
       name,
       address,
       mapLink: mapLink || null,
       openTime,
       closeTime,
       tenantId: tenant?.id,
       isActive: true
    }
  });

  revalidatePath("/admin/outlets");
}

export async function updateLocationSettings(formData: FormData) {
   const session = await getSession();
   if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'OUTLET_MANAGER' && session.role !== 'GLOBAL_MANAGER')) throw new Error("Unauthorized");
   
   const locationId = formData.get("locationId") as string;
   const openTime = sanitizeText(formData.get("openTime") as string);
   const closeTime = sanitizeText(formData.get("closeTime") as string);
   const isActive = formData.get("isActive") === "true";
   
   await prisma.location.update({
      where: { id: locationId },
      data: { openTime, closeTime, isActive }
   });
   revalidatePath("/admin/outlets");
}

export async function createOutletManager(formData: FormData) {
  const session = await getSession()
  if (session?.role !== 'SUPER_ADMIN' && session?.role !== 'GLOBAL_MANAGER') throw new Error("Unauthorized");

  const name = sanitizeText(formData.get("name") as string);
  const email = sanitizeText(formData.get("email") as string);
  const password = formData.get("password") as string;
  const locationId = formData.get("locationId") as string;
  const accessLevel = formData.get("accessLevel") as "OUTLET_MANAGER" | "OUTLET_ADMIN";

  if (!name || !email || !password || !locationId || !accessLevel) throw new Error("Missing required fields");

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error("A user with this email already exists");

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: accessLevel,
      managedLocationId: locationId
    }
  });

  revalidatePath("/admin/outlets");
}

export async function createGlobalManager(formData: FormData) {
  const session = await getSession()
  if (session?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");

  const name = sanitizeText(formData.get("name") as string);
  const phoneNumber = sanitizeText(formData.get("phoneNumber") as string);
  const password = formData.get("password") as string;

  if (!name || !phoneNumber || !password) throw new Error("Missing required fields");

  const exists = await prisma.user.findUnique({ where: { phoneNumber } });
  if (exists) throw new Error("A user with this mobile number already exists");

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      phoneNumber,
      passwordHash,
      role: "GLOBAL_MANAGER"
    }
  });

  revalidatePath("/admin/outlets");
}
