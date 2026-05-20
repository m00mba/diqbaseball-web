import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const pathname = request.nextUrl.pathname

  // Redirect facility.diqbaseball.com to /facility/login
  if (host.startsWith('facility.')) {
    if (pathname === '/' || pathname === '') {
      return NextResponse.redirect(new URL('/facility/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/facility'],
}
