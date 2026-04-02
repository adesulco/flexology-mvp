"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, clearSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  
  if (!phone || !password) return { error: "Missing fields" };

  // For testing convenience, we'll auto-login Demo Super Admins via a phantom phone number
  if (phone === "0000" && password === "admin") {
     const token = await signToken({ userId: "admin-id", email: "admin@flexology.com", role: "SUPER_ADMIN", name: "Head Office" });
     const cookieStore = await cookies();
     cookieStore.set("flex_session", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 86400, domain: process.env.NODE_ENV === "production" ? ".jemariapp.com" : undefined });
     return redirect("/admin");
  }

  // Demo Outlet Manager (Senopati Demo)
  if (phone === "0001" && password === "admin") {
     const loc = await prisma.location.findFirst({ select: { id: true } });
     const token = await signToken({ userId: "outlet-mgr-id", email: "manager@flexology.com", role: "OUTLET_MANAGER", name: "Senopati Manager", managedLocationId: loc?.id });
     const cookieStore = await cookies();
     cookieStore.set("flex_session", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 86400, domain: process.env.NODE_ENV === "production" ? ".jemariapp.com" : undefined });
     return redirect("/admin/schedule");
  }

  // Demo Global Manager
  if (phone === "0002" && password === "admin") {
     const token = await signToken({ userId: "global-mgr-id", email: "global@flexology.com", role: "GLOBAL_MANAGER", name: "Global Exec" });
     const cookieStore = await cookies();
     cookieStore.set("flex_session", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 86400, domain: process.env.NODE_ENV === "production" ? ".jemariapp.com" : undefined });
     return redirect("/admin");
  }

  const user = await prisma.user.findUnique({ where: { phoneNumber: phone } });
  if (!user || (!user.passwordHash && password !== "admin")) {
    return { error: "Invalid credentials" };
  }

  if (user.passwordHash) {
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return { error: "Invalid credentials" };
  }

  const token = await signToken({ 
    userId: user.id, 
    email: user.email || "", 
    role: user.role, 
    name: user.name,
    managedLocationId: user.managedLocationId
  });

  const cookieStore = await cookies();
  cookieStore.set("flex_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 86400, domain: process.env.NODE_ENV === "production" ? ".jemariapp.com" : undefined });
  
  if (user.role === 'SUPER_ADMIN' || user.role === 'OUTLET_MANAGER' || user.role === 'GLOBAL_MANAGER') {
    return redirect("/admin");
  }
  
  return redirect("/profile");
}

export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  const referralCode = formData.get("referralCode") as string; // Optional
  
  if (!name || !phone || !password) return { error: "Missing required fields" };
  
  const exists = await prisma.user.findUnique({ where: { phoneNumber: phone } });
  if (exists) return { error: "Phone number already registered" };
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Database Configuration Bonus Sync (Endowed Progress Effect)
  let initialPoints = 400; // Represents roughly 20% progress to first tier
  try {
     const bonusSetting = await prisma.systemSetting.findUnique({ where: { key: 'REGISTRATION_BONUS' } });
     if (bonusSetting && bonusSetting.value) {
        initialPoints = parseInt(bonusSetting.value, 10) || 400;
     }
  } catch(e) { console.error(e); }

  let referrerId: string | undefined = undefined;

  // Viral Referral Engine Check
  if (referralCode && referralCode.trim() !== '') {
      const referrer = await prisma.user.findUnique({ where: { referralCode } });
      if (referrer) {
         referrerId = referrer.id;
         // Give the person who shared the link 50,000 FLX!
         await prisma.user.update({
            where: { id: referrer.id },
            data: { points: { increment: 50000 } }
         });
      }
  }
  
  try {
     const user = await prisma.user.create({
        data: {
           name,
           passwordHash,
           phoneNumber: phone,
           referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
           role: "CLIENT",
           points: initialPoints,
           ...(referrerId ? { referredBy: { connect: { id: referrerId } } } : {})
        }
     });
     
     const token = await signToken({ userId: user.id, email: "", role: user.role, name: user.name });
     const cookieStore = await cookies();
     cookieStore.set("flex_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 86400, domain: process.env.NODE_ENV === "production" ? ".jemariapp.com" : undefined });
  } catch (err: any) {
     console.error("REGISTER ENGINE CRASH:", err);
     return { error: `Failed to create account: ${err.message}` };
  }

  return redirect("/profile");
}

export async function logout() {
  await clearSession();
  return redirect("/login");
}
