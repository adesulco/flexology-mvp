import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_super_secret_flexology_string_for_local_dev"
)

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('flex_session')?.value
  const path = request.nextUrl.pathname
  const hostname = request.headers.get("host") || "";

  // Strategy: Subdomain Extraction
  let tenantSlug = 'flex'; // Default local tenant
  
  if (hostname === "jemariapp.com" || hostname === "www.jemariapp.com") {
      tenantSlug = "root";
  } else if (hostname.includes(".jemariapp.com")) {
      tenantSlug = hostname.split(".")[0];
  } else if (request.nextUrl.searchParams.has("tenant")) {
      tenantSlug = request.nextUrl.searchParams.get("tenant")!;
  } else if (request.nextUrl.searchParams.has("root")) {
      // Local testing override for root marketplace
      tenantSlug = "root";
  }

  // Pre-bake the custom header into the request pipeline
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-slug', tenantSlug);

  // Public paths that bypass auth checking (Guest Checkout enabled for /book)
  if (path === '/login' || path === '/register' || path === '/' || path.startsWith('/book') || path.startsWith('/api/') || path.startsWith('/_next') || path.includes('.')) {
    // If we get a clear=true flag, forcibly strip the token
    if (request.nextUrl.searchParams.get('clear') === 'true') {
        const res = NextResponse.redirect(new URL('/login', request.url))
        res.cookies.set('flex_session', '', { maxAge: 0, domain: process.env.NODE_ENV === "production" ? ".jemariapp.com" : undefined })
        return res
    }
    // Check if token exists AND is actually valid before bouncing
    if (token && (path === '/login' || path === '/register')) {
       try {
          await jwtVerify(token, JWT_SECRET)
          return NextResponse.redirect(new URL('/profile', request.url))
       } catch {
           // Token is invalid, let them stay on login page and clear it
          const res = NextResponse.next({
             request: { headers: requestHeaders }
          });
          res.cookies.set('flex_session', '', { maxAge: 0, domain: process.env.NODE_ENV === "production" ? ".jemariapp.com" : undefined })
          return res
       }
    }
    return NextResponse.next({
       request: { headers: requestHeaders }
    });
  }

  // If trying to access protected paths without token
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url))
  } else {
    try {
      // Validate token structure
      const { payload } = await jwtVerify(token, JWT_SECRET)
      
      // Admin protection block
      if (path.startsWith('/admin')) {
        if (payload.role !== 'SUPER_ADMIN' && payload.role !== 'OUTLET_MANAGER' && payload.role !== 'GLOBAL_MANAGER') {
           return NextResponse.redirect(new URL('/profile', request.url)) // Bounce back
        }
        
        // Strict Firewall for Outlet Managers
        if (payload.role === 'OUTLET_MANAGER') {
           if (path.startsWith('/admin/staff') || path.startsWith('/admin/outlets') || path.startsWith('/admin/settings')) {
              return NextResponse.redirect(new URL('/admin', request.url))
           }
        }
      }
    } catch (e) {
      // Invalid token, force re-login and actually clear the browser cookie
      const res = NextResponse.redirect(new URL('/', request.url))
      res.cookies.set('flex_session', '', { maxAge: 0, domain: process.env.NODE_ENV === "production" ? ".jemariapp.com" : undefined })
      return res
    }
  }

  return NextResponse.next({
     request: { headers: requestHeaders }
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
