import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_super_secret_flexology_string_for_local_dev"
)

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('flex_session')?.value
  const path = request.nextUrl.pathname

  // Public paths that bypass auth checking
  if (path === '/login' || path === '/register' || path === '/' || path.startsWith('/api/') || path.startsWith('/_next') || path.includes('.')) {
    // If logged in and trying to access /login, bounce to /profile
    if (token && (path === '/login' || path === '/register')) {
      return NextResponse.redirect(new URL('/profile', request.url))
    }
    return NextResponse.next()
  }

  // If trying to access protected paths without token
  if (!token) {
    if (path.startsWith('/admin') || path.startsWith('/profile') || path.startsWith('/book')) {
       return NextResponse.redirect(new URL('/login', request.url))
    }
  } else {
    try {
      // Validate token structure
      const { payload } = await jwtVerify(token, JWT_SECRET)
      
      // Admin protection block
      if (path.startsWith('/admin')) {
        if (payload.role !== 'SUPER_ADMIN' && payload.role !== 'OUTLET_MANAGER') {
           return NextResponse.redirect(new URL('/profile', request.url)) // Bounce back
        }
      }
    } catch (e) {
      // Invalid token, force re-login
      request.cookies.delete('flex_session')
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
