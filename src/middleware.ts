import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { authConfig } from '@/config/auth.config';
import { publicRoutes, authRoutes } from '@/config/routes.config';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const { response, user } = await updateSession(request);

  if (isPublic && !isAuthRoute) return response;

  if (!user) {
    if (isAuthRoute) return response;

    const loginUrl = new URL(authConfig.redirects.loginPage, request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL(authConfig.redirects.afterLogin, request.url));
  }

  // Inject user ID into request headers so route handlers can read it without
  // needing to re-validate the JWT (avoids Supabase SSR cookie issues in Node runtime)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.id);
  const authedResponse = NextResponse.next({ request: { headers: requestHeaders } });
  response.cookies.getAll().forEach((c) => authedResponse.cookies.set(c.name, c.value, c));
  return authedResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
