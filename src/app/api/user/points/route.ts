import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ points: 0 }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId as string },
      select: { points: true, tier: true }
    });

    return NextResponse.json({ points: user?.points || 0, tier: user?.tier || 'FLEX' });
  } catch (err) {
    return NextResponse.json({ points: 0 }, { status: 500 });
  }
}
