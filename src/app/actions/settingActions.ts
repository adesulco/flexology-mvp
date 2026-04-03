"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateSystemSetting(formData: FormData) {
  const session = await getSession();
  if (session?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");

  const key = formData.get("key") as string;
  const value = formData.get("value") as string;

  if (!key || !value) throw new Error("Missing required fields");

  await prisma.systemSetting.upsert({
     where: { key },
     update: { value },
     create: { key, value }
  });

  console.info(`[AUDIT LOG] ${session.email} updated System Setting <${key}> to ${value}`);
  revalidatePath("/admin/settings");
  revalidatePath("/register");
}

export async function updateMembershipTier(formData: FormData) {
  const session = await getSession();
  if (session?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");

  const tierId = formData.get("tierId") as string;
  const name = formData.get("name") as string;
  const price = parseInt(formData.get("price") as string);
  const discountPercent = parseInt(formData.get("discountPercent") as string);
  const pointMultiplier = parseFloat(formData.get("pointMultiplier") as string);
  
  // Benefits come in as a single string, line-break separated
  const benefitsStr = formData.get("benefits") as string;
  const benefits = benefitsStr ? benefitsStr.split('\n').map(s => s.trim()).filter(Boolean) : [];

  if (!tierId || !name) throw new Error("Missing required fields");

  await prisma.membershipTier.update({
     where: { id: tierId },
     data: {
        name,
        price,
        discountPercent,
        pointMultiplier,
        benefits
     }
  });

  console.info(`[AUDIT LOG] ${session.email} updated Membership Tier ${name} (${tierId})`);
  revalidatePath("/admin/settings");
  revalidatePath("/rewards");
  revalidatePath("/subscribe");
}
