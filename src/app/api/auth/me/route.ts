import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('flex_session')?.value;
  if (!token) return Response.json(null, { status: 401 });
  try {
    const decoded = await verifyToken(token);
    return Response.json(decoded);
  } catch {
    return Response.json(null, { status: 401 });
  }
}
