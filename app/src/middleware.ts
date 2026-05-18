import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Read Supabase config — prefer non-NEXT_PUBLIC_ vars (runtime only, never inlined)
  // fall back to NEXT_PUBLIC_ vars (may be inlined at build time)
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    '';
  const supabaseKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const { createServerClient } = await import('@supabase/ssr');

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isAuthPage = request.nextUrl.pathname.startsWith('/(auth)') ||
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register');

  const isSharePage = request.nextUrl.pathname.startsWith('/share');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/');

  // Allow public access to share pages and API routes (API routes handle their own auth)
  if (isSharePage || isApiRoute) {
    return supabaseResponse;
  }

  // Redirect to login if not authenticated and not already on an auth page
  if (!user && !isAuthPage) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to home if already authenticated and on auth page
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|share-cards|textures|manifest.json).*)',
  ],
};
