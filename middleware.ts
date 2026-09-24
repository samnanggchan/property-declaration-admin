import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass Next.js internal files, static assets, and Next.js API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const hasAuthCookies = Boolean(accessToken || refreshToken);

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  // If already authenticated and trying to access /login, redirect to /dashboard
  if (pathname === '/login' && hasAuthCookies) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If not authenticated and trying to access protected paths, redirect to /login
  if (!hasAuthCookies && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('from', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login-bg.jpeg).*)'],
};
