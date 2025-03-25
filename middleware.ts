import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/auth'

export async function middleware(request: NextRequest) {
  const session = await auth()
  const isAuthenticated = !!session
  const url = request.nextUrl.clone()
  
  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/jobs', '/resume']
  const isProtectedPath = protectedPaths.some(path => 
    url.pathname === path || url.pathname.startsWith(`${path}/`)
  )
  
  // If trying to access a protected route and not authenticated
  if (isProtectedPath && !isAuthenticated) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  
  // User is authenticated, allow access to protected routes
  return NextResponse.next()
}

// See https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 