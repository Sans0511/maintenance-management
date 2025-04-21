import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authenticateUser } from './lib/middleware/auth'

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const pathname = url.pathname

  const authResult = await authenticateUser(req)

  if (!authResult.success) {
    url.pathname = '/signin'
    return NextResponse.redirect(url)
  }

  const role = authResult.role

  if (pathname.startsWith('/user') && role !== 'USER') {
    url.pathname = '/unauthorized'
    return NextResponse.redirect(url)
  }

  if (pathname === '/' && role !== 'ADMIN') {
    url.pathname = '/unauthorized'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/user/:path*'],
}
