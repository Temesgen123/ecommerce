// ============================================================
// proxy.ts   (project root )
// ============================================================
// Runs on every request that matches `config.matcher`.
// Redirects unauthenticated visitors away from /admin and
// /driver pages before the page even renders, and enforces
// role separation: drivers can't reach /admin, and non-driver/
// non-admin users can't reach /driver.
//
// Uses the lightweight JWT helper from next-auth so this can
// run at the Edge without a database round-trip.
// ============================================================

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function proxy(request) {
    const { pathname } = request.nextUrl;
    const token = request.nextauth.token;
    const role = token?.role as string | undefined;

    const isAdminRoute = pathname.startsWith('/admin');
    const isDriverRoute = pathname.startsWith('/driver');

    // Drivers can't access /admin
    if (isAdminRoute && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/driver/login', request.url));
    }

    // /driver requires DRIVER or ADMIN (admins get oversight access)
    if (isDriverRoute && role !== 'DRIVER' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/driver/login', request.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: '/admin/login',
    },
  },
);

export const config = {
  matcher: [
    '/admin/((?!login).*)', // match /admin/* but NOT /admin/login
    '/driver/((?!login).*)', // match /driver/* but NOT /driver/login
  ],
};
