import { headers } from "next/headers";
import { prisma } from "./prisma";

export async function getTenant() {
  const headersList = await headers();
  const slug = headersList.get("x-tenant-slug") || "flex";

  if (slug === "root") return null;

  // Use an ultra-fast query to look up the brand specifics
  const tenant = await prisma.tenant.findUnique({
    where: { slug }
  });

  return tenant;
}
