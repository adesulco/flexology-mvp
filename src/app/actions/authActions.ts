"use server";


import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, clearSession } from "@/lib/auth";
import { sanitizeText, sanitizePhone } from "@/lib/sanitize";
import { checkLoginRateLimit } from "@/lib/rateLimit";
import { headers } from "next/headers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  try {
    // RATE LIMIT CHECK — runs before anything else
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    const rateCheck = await checkLoginRateLimit(ip);
    if (!rateCheck.allowed) {
      return { success: false, error: `Too many login attempts. Please try again in ${rateCheck.retryAfter} seconds.` };
    }

    // BLOCKED CREDENTIALS CHECK — runs second (from Mission 3)
    const BLOCKED_USERNAMES = new Set(['0000', 'admin', 'test', 'demo', 'root', 'superadmin']);
    const phone = (sanitizeText(formData.get('phone') as string) || '').trim();
    if (BLOCKED_USERNAMES.has(phone.toLowerCase())) {
      return { success: false, error: 'Invalid credentials. Please try again.' };
    }

    const password = formData.get("password") as string;
    if (!phone || !password) return { success: false, error: "Missing fields" };

    const recordFailure = () => { return { success: false, error: "Invalid credentials. Please try again." }; };

  // Secure Demo Super Admins (FLX-004)
  if (phone === "88888888" && password === "FlexologyHub2026!") {
     const token = await signToken({ userId: "admin-id", email: "admin@flexology.com", role: "SUPER_ADMIN", name: "Head Office" });
     const cookieStore = await cookies();
     cookieStore.set("flex_session", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 86400, domain: process.env.NODE_ENV === "production" ? ".jemariapp.com" : undefined });
     return { success: true, redirectUrl: "/admin" };
  }

  // Secure Demo Outlet Manager (Senopati Demo)
  if (phone === "88880001" && password === "FlexOutlet2026!") {
     const loc = await prisma.location.findFirst({ select: { id: true } });
     const token = await signToken({ userId: "outlet-mgr-id", email: "manager@flexology.com", role: "OUTLET_MANAGER", name: "Senopati Manager", managedLocationId: loc?.id });
     const cookieStore = await cookies();
     cookieStore.set("flex_session", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 86400, domain: process.env.NODE_ENV === "production" ? ".jemariapp.com" : undefined });
     return { success: true, redirectUrl: "/admin/schedule" };
  }

  // Secure Demo Global Manager
  if (phone === "88880002" && password === "FlexGlobal2026!") {
     const token = await signToken({ userId: "global-mgr-id", email: "global@flexology.com", role: "GLOBAL_MANAGER", name: "Global Exec" });
     const cookieStore = await cookies();
     cookieStore.set("flex_session", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 86400, domain: process.env.NODE_ENV === "production" ? ".jemariapp.com" : undefined });
     return { success: true, redirectUrl: "/admin" };
  }

  const user = await prisma.user.findUnique({ where: { phoneNumber: phone } });
  if (!user || (!user.passwordHash)) {
    return recordFailure();
  }

  if (user.passwordHash) {
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return recordFailure();
  }

    // Authentication success
    const token = await signToken({ 
      userId: user.id, 
      email: user.email || "", 
      role: user.role, 
      name: user.name,
      managedLocationId: user.managedLocationId
    });

    const cookieStore = await cookies();
    cookieStore.set("flex_session", token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 86400, domain: process.env.NODE_ENV === "production" ? ".jemariapp.com" : undefined });
    
    if (user.role === 'SUPER_ADMIN' || user.role === 'OUTLET_MANAGER' || user.role === 'GLOBAL_MANAGER') {
      return { success: true, redirectUrl: "/admin" };
    }
    if (user.role === 'OUTLET_ADMIN') {
      return { success: true, redirectUrl: "/pos" };
    }
    return { success: true, redirectUrl: "/profile" };
  } catch (error: any) {
    console.error('login failed:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function register(formData: FormData) {
  try {
    const name = sanitizeText(formData.get("name") as string);
    const phone = sanitizePhone(sanitizeText(formData.get("phone") as string));
    const password = formData.get("password") as string;
    const rawRef = formData.get("referralCode");
    const referralCode = rawRef ? sanitizeText(rawRef as string) : "";
    
    if (!name || name.length < 2) {
      return { success: false, error: 'Please enter a valid name (at least 2 characters) after sanitization.' };
    }
    if (!phone || !password) return { success: false, error: "Missing required fields" };
    
    const exists = await prisma.user.findUnique({ where: { phoneNumber: phone } });
    if (exists) return { success: false, error: "Phone number already registered" };
  
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
       cookieStore.set("flex_session", token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 86400, domain: process.env.NODE_ENV === "production" ? ".jemariapp.com" : undefined });
    } catch (err: any) {
       console.error("REGISTER ENGINE CRASH:", err);
       return { success: false, error: `Failed to create account: ${err.message}` };
    }

    return { success: true, redirectUrl: "/profile" };
  } catch (error: any) {
    console.error('register failed:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function logout() {
  await clearSession();
  return redirect("/login");
}
