"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const ageStr = formData.get("age") as string;
  const gender = formData.get("gender") as string;
  const prefGender = formData.get("prefGender") as string;
  const prefPressure = formData.get("prefPressure") as string;
  if (!name || !phone) return { error: "Name and Phone are required" };

  try {
     const existing = await prisma.user.findFirst({ where: { phoneNumber: phone } });
     if (existing && existing.id !== session.userId) {
        return { error: "Phone number already in use by another account" };
     }

     await prisma.user.update({
       where: { id: session.userId as string },
       data: {
         name,
         phoneNumber: phone,
         // @ts-ignore: Prisma cache lag
         age: ageStr ? parseInt(ageStr) : null,
         gender: gender || null,
         prefGender: prefGender || null,
         prefPressure: prefPressure || null
       }
     });

     revalidatePath("/profile");
     return { success: true };
  } catch (err: any) {
     console.error("Profile update failed:", err);
     return { error: "Failed to update profile. Please try again." };
  }
}

export async function claimMysteryBox() {
   const session = await getSession();
   if (!session) return { error: "Unauthorized" };

   const user = await prisma.user.findUnique({ where: { id: session.userId as string } });
   if (!user || user.mysteryBoxes <= 0) return { error: "No mystery boxes available." };

   // Variable-ratio reward engine (similar to Gacha)
   const roll = Math.random();
   let rewardPoints = 0;
   let rewardName = "Bonus Points";

   if (roll > 0.95) { rewardPoints = 50000; rewardName = "Jackpot: 50,000 FLX!"; }
   else if (roll > 0.80) { rewardPoints = 25000; rewardName = "Rare: 25,000 FLX!"; }
   else if (roll > 0.40) { rewardPoints = 10000; rewardName = "Uncommon: 10,000 FLX"; }
   else { rewardPoints = 5000; rewardName = "Common: 5,000 FLX"; }

   await prisma.user.update({
      where: { id: session.userId as string },
      data: {
         mysteryBoxes: { decrement: 1 },
         points: { increment: rewardPoints }
      }
   });

   revalidatePath("/profile");
   return { success: true, rewardName, rewardPoints };
}
