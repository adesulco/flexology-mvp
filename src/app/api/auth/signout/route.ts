import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set("flex_session", "", {
    maxAge: 0,
    path: "/",
    domain: process.env.NODE_ENV === "production" ? ".jemariapp.com" : undefined,
  });
  return NextResponse.json({ success: true });
}
