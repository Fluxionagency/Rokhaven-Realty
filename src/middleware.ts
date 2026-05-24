import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/admin-login', req.url));
    }
    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  if (pathname.startsWith('/client-portal')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/client-login', req.url));
    }
    if (token.role !== 'CLIENT' && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/client-login', req.url));
    }
  }

  if (pathname.startsWith('/principal-portal')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/principal-login', req.url));
    }
    if (token.role !== 'PRINCIPAL' && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/principal-login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/client-portal/:path*', '/principal-portal/:path*'],
};
