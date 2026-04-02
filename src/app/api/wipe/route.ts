import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const result = await prisma.flexologist.deleteMany({});
  return NextResponse.json({ deleted: result.count });
}
