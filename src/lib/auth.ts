import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_super_secret_flexology_string_for_local_dev"
);

export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("flex_session")?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set("flex_session", "", { 
     maxAge: 0, 
     domain: process.env.NODE_ENV === "production" ? ".jemariapp.com" : undefined,
     path: "/",
     httpOnly: true,
     secure: process.env.NODE_ENV === "production",
     sameSite: "lax" 
  });
}
