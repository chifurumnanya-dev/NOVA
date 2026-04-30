import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE = 'nova_admin';

export function middleware(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;

  if (!secret || cookie !== secret) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin-login';
    url.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
