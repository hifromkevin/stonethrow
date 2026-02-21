import { updateSession } from '@/lib/supabase/proxy';
import { NextResponse, type NextRequest } from 'next/server';

const APP_SUBDOMAIN_PATTERNS = ['app.getstonethrow.com', 'app.localhost'];

function isAppSubdomain(hostname: string): boolean {
  return APP_SUBDOMAIN_PATTERNS.some(
    (pattern) => hostname === pattern || hostname.startsWith(pattern + ':') // handles app.localhost:3000
  );
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  if (isAppSubdomain(hostname)) {
    if (pathname.startsWith('/api/')) {
      const url = request.nextUrl.clone();
      url.pathname = `/app${pathname}`;
      return NextResponse.rewrite(url);
    }

    // For non-API routes, run auth check
    const sessionResponse = await updateSession(request);

    // If updateSession returned a redirect (to /login or /dashboard), honor it
    if (sessionResponse.status === 307 || sessionResponse.status === 308) {
      return sessionResponse;
    }

    // Rewrite to /app/... and copy cookies from session response
    const url = request.nextUrl.clone();
    url.pathname = `/app${pathname}`;
    const rewriteResponse = NextResponse.rewrite(url);

    sessionResponse.cookies.getAll().forEach((cookie) => {
      rewriteResponse.cookies.set(cookie.name, cookie.value, cookie);
    });

    return rewriteResponse;
  }

  // Root domain: serve marketing site (no auth, no rewrite)
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
