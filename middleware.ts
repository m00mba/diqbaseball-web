import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const pathname = request.nextUrl.pathname

  // Redirect facility.diqbaseball.com root to /facility/login
  if (host.includes('facility.diqbaseball') && pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/facility/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/'],
}
