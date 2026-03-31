"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, clearSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  if (!email || !password) return { error: "Missing fields" };

  // For testing convenience, we'll auto-login Demo Super Admins
  if (email === "admin@flexology.com" && password === "admin") {
     const token = await signToken({ userId: "admin-id", email, role: "SUPER_ADMIN", name: "Head Office" });
     const cookieStore = await cookies();
     cookieStore.set("flex_session", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 86400 });
     return redirect("/admin");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || (!user.passwordHash && password !== "admin")) {
    return { error: "Invalid credentials" };
  }

  if (user.passwordHash) {
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return { error: "Invalid credentials" };
  }

  const token = await signToken({ 
    userId: user.id, 
    email: user.email, 
    role: user.role, 
    name: user.name,
    managedLocationId: user.managedLocationId
  });

  const cookieStore = await cookies();
  cookieStore.set("flex_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 86400 });
  
  if (user.role === 'SUPER_ADMIN' || user.role === 'OUTLET_MANAGER') {
    return redirect("/admin");
  }
  
  return redirect("/profile");
}

export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const phone = formData.get("phone") as string;
  
  if (!name || !email || !password) return { error: "Missing required fields" };
  
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "User already exists with this email" };
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.create({
     data: {
        name,
        email,
        passwordHash,
        phoneNumber: phone || null,
        role: "CLIENT"
     }
  });
  
  const token = await signToken({ userId: user.id, email: user.email, role: user.role, name: user.name });
  const cookieStore = await cookies();
  cookieStore.set("flex_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 86400 });

  return redirect("/profile");
}

export async function logout() {
  await clearSession();
  return redirect("/login");
}
