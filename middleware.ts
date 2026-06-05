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

  // Read role directly from JWT claims injected by custom_access_token_hook
  const role = (user.app_metadata?.role as string) ||
             (user.user_metadata?.role as string) ||
             null;

  if (role !== 'admin') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/admin/:path*'],
};
