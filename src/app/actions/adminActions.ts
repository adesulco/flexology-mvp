"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/auth"

export async function createFlexologist(formData: FormData) {
  const session = await getSession()
  if (session?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const specialty = formData.get("specialty") as string
  const locationId = formData.get("locationId") as string
  const canHomeService = formData.get("canHomeService") === "on"

  if (!name || !specialty) throw new Error("Missing required fields")

  await prisma.flexologist.create({
    data: {
       name,
       bio: specialty,
       locationId: locationId || null,
       canHomeService,
       rating: 5.0,
       imageUrl: "https://i.pravatar.cc/150?u=" + Date.now()
    }
  })

  revalidatePath("/admin/staff")
}

export async function updateBookingStatus(bookingId: string, status: string, assignedFlexologistId?: string) {
  const session = await getSession()
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'OUTLET_MANAGER')) throw new Error("Unauthorized")

  // Prevent generic update failures
  if (!bookingId || !status) return { error: "Invalid payload" }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
       status: status as any,
       ...(assignedFlexologistId ? { flexologistId: assignedFlexologistId } : {})
    }
  })

  revalidatePath("/admin")
  return { success: true }
}
