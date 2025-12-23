import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the path starts with /dashboard
  /*
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Check for the access_token cookie
    const token = request.cookies.get('access_token')

    // If no token is present, redirect to login page
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      // Optional: Add a return URL parameter to redirect back after login
      loginUrl.searchParams.set('from', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  */

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths starting with /dashboard
     */
    '/dashboard/:path*',
  ],
}
