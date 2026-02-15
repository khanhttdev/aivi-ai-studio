import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// 1. Define next-intl middleware
const intlMiddleware = createMiddleware({
    locales: ['en', 'vi'],
    defaultLocale: 'vi'
});

export default async function middleware(request: NextRequest) {
    // 2. Run next-intl middleware first to handle locale routing/redirects
    // This returns a response object (e.g. with rewritten URL or redirect)
    const response = intlMiddleware(request);

    // 3. Setup Supabase client to manage session within the response context
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );

                    // If next-intl returned a response, we update its cookies
                    // But if we need to create a new response (e.g. for redirect), we handles it
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // 4. Check user session
    // This ensures auth cookies are refreshed if needed
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // 5. Protected Routes Logic
    // We need to account for locale component in the path: /vi/image-studio or /en/image-studio
    const pathname = request.nextUrl.pathname;

    // Helper to check if path matches protected routes (ignoring locale)
    const isProtectedRoute = (path: string) => {
        const protectedPaths = ['/image-studio', '/story-studio', '/profile'];
        // Remove locale prefix if present (e.g. /vi/image-studio -> /image-studio)
        const pathConnect = path.replace(/^\/(?:en|vi)/, '') || '/';
        return protectedPaths.some(p => pathConnect.startsWith(p));
    };

    const isAuthRoute = (path: string) => {
        const authPaths = ['/login', '/auth'];
        const pathConnect = path.replace(/^\/(?:en|vi)/, '') || '/';
        return authPaths.some(p => pathConnect.startsWith(p));
    };

    // Redirect to login if accessing protected route without user
    if (!user && isProtectedRoute(pathname)) {
        // We need to redirect to /login but preserve locale if possible
        // But simply redirecting to /login will let next-intl middleware handle the locale addition on next request if configured
        // However, we are inside middleware.

        // Let's redirect to /login (next-intl will eventually redirect to /vi/login or /en/login)
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // Redirect to app if logged in and trying to access login
    if (user && isAuthRoute(pathname)) {
        const url = request.nextUrl.clone();
        url.pathname = '/image-studio';
        return NextResponse.redirect(url);
    }

    // 6. Add Security Headers (CSP + others)
    const cspDirectives = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://lh3.googleusercontent.com https://api.dicebear.com https://ui-avatars.com",
        "connect-src 'self' https://*.supabase.co https://*.supabase.in https://generativelanguage.googleapis.com https://api.elevenlabs.io wss://*.supabase.co",
        "media-src 'self' data: blob:",
        "frame-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
    ];

    response.headers.set('Content-Security-Policy', cspDirectives.join('; '));
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
    response.headers.set('X-DNS-Prefetch-Control', 'on');

    return response;
}

export const config = {
    // Match only internationalized pathnames and exclude static files, API, and auth routes
    matcher: ['/', '/(vi|en)/:path*', '/((?!api|auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
};
