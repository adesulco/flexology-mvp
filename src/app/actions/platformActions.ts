"use server";
import { sanitizeText } from "@/lib/sanitize";


import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/auth"

export async function provisionTenant(formData: FormData) {
  const session = await getSession()
  if (session?.role !== 'PLATFORM_OWNER') {
    throw new Error("Unauthorized: Only Jemari Platform Owners can provision new SaaS instances.");
  }

  const name = sanitizeText(formData.get("name") as string);
  const slug = sanitizeText(formData.get("slug") as string);
  const colorHex = sanitizeText(formData.get("colorHex") as string);

  if (!name || !slug) throw new Error("Missing required parameters for deployment");

  // Validate Slug
  const sanitizeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');

  const existing = await prisma.tenant.findUnique({
     where: { slug: sanitizeSlug }
  });

  if (existing) throw new Error(`Subdomain ${sanitizeSlug}.jemariapp.com is already occupied by another brand.`);

  // Boot the tenant into the PostgreSQL Database
  await prisma.tenant.create({
     data: {
        name,
        slug: sanitizeSlug,
        primaryColor: colorHex || "#000000",
        isActive: true
     }
  });

  revalidatePath("/jemari-hub");
}
