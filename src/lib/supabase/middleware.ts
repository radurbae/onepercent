import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

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
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const publicPaths = [
        '/login',
        '/auth/callback',
        '/offline',
        '/landing',
        '/privacy',
        '/terms',
        '/demo',
    ];
    const isPublicPath = publicPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    );

    const pathname = request.nextUrl.pathname;

    if (user && (pathname === '/landing' || pathname === '/demo' || pathname === '/privacy' || pathname === '/terms' || pathname === '/login')) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    if (!user && pathname === '/') {
        const url = request.nextUrl.clone();
        url.pathname = '/landing';
        return NextResponse.redirect(url);
    }

    if (!user && !isPublicPath) {
        // no user, redirect to landing page first
        const url = request.nextUrl.clone();
        url.pathname = '/landing';
        return NextResponse.redirect(url);
    }

    // IMPORTANT: You *must* return the supabaseResponse object as is.
    // If you're sure you want to modify the response, do so carefully:
    // 1. Prefer to create a new response object using NextResponse.next()
    // 2. Copy over all the cookies from supabaseResponse
    // 3. Change the response object accordingly
    // 4. Return it
    return supabaseResponse;
}
