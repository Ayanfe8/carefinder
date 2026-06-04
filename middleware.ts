import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Build a response we can mutate to forward refreshed session cookies.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookies back onto the request so subsequent middleware/handlers
          // see the refreshed session, then copy them to the response.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: use getUser() — it validates the JWT with the Supabase server.
  // Never replace this with getSession(), which only decodes locally (insecure).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';

  // Pass the login page through unconditionally.
  if (!isAdminRoute || isLoginPage) {
    return supabaseResponse;
  }

  // No authenticated user → redirect to login.
  if (!user) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Decode the JWT to read the custom `role` claim injected by Migration 007.
  // getUser() already validated the token, so local decoding is safe here.
  const { data: { session } } = await supabase.auth.getSession();
  let role: string | null = null;
  if (session?.access_token) {
    try {
      const payload = JSON.parse(
        atob(session.access_token.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/'))
      );
      role = (payload as Record<string, unknown>).role as string ?? null;
    } catch {
      // Malformed token — treat as unauthorised.
    }
  }

  if (role !== 'admin') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/admin/:path*'],
};
