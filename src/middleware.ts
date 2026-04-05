import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('flex_session')?.value;
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const decoded = await verifyToken(token) as any;
      if (!decoded) {
        throw new Error('Invalid token');
      }

      const validRoles = ['admin', 'superadmin', 'SUPER_ADMIN', 'GLOBAL_MANAGER', 'OUTLET_MANAGER'];
      if (!validRoles.includes(decoded.role as string)) {
         return NextResponse.redirect(new URL('/login', request.url));
      }

      // SECURITY: Block tokens for test accounts (from Mission 3)
      const BLOCKED_PHONES = ['0000', 'admin', 'test', 'demo', 'root'];
      if (decoded.phone && BLOCKED_PHONES.includes(decoded.phone.toString().toLowerCase())) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('flex_session');
        return response;
      }

      // Valid token, authorized user → allow access
      return NextResponse.next();
    } catch {
      // Invalid/expired token → clear cookie and redirect
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('flex_session');
      return response;
    }
  }

  // Non-admin routes → pass through
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
