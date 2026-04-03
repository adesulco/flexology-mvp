"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addCustomerNote(userId: string, content: string) {
   const session = await getSession();
   if (!session || !['OUTLET_ADMIN', 'OUTLET_MANAGER', 'SUPER_ADMIN'].includes(session.role as string)) throw new Error("Unauthorized");

   await prisma.customerNote.create({
      data: {
         userId,
         authorId: session.userId as string,
         content
      }
   });

   revalidatePath("/pos/customers");
   return { success: true };
}
