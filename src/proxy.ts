import jwt, { JwtPayload } from 'jsonwebtoken';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getDefaultDashboardRoute, getRouteOwner, isAuthRoute, UserRole } from './lib/auth-utils';
import { verifyResetPasswordToken } from './lib/jwtHanlders';
import { getNewAccessToken } from './services/auth/auth.service';
import { getUserInfo } from './services/auth/getUserInfo';
import { deleteCookie, getCookie } from './services/auth/tokenHandlers';



// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const hasTokenRefreshedParam = request.nextUrl.searchParams.has('tokenRefreshed');

    // If coming back after token refresh, remove the param and continue
    if (hasTokenRefreshedParam) {
        const url = request.nextUrl.clone();
        url.searchParams.delete('tokenRefreshed');
        return NextResponse.redirect(url);
    }

    const tokenRefreshResult = await getNewAccessToken();

    // If token was refreshed, redirect to same page to fetch with new token
    if (tokenRefreshResult?.tokenRefreshed) {
        const url = request.nextUrl.clone();
        url.searchParams.set('tokenRefreshed', 'true');
        return NextResponse.redirect(url);
    }

    // const accessToken = request.cookies.get("accessToken")?.value || null;

    const accessToken = await getCookie("accessToken") || null;

    let userRole: UserRole | null = null;
    if (accessToken) {
        const verifiedToken: JwtPayload | string = jwt.verify(accessToken, process.env.JWT_SECRET as string);

        if (typeof verifiedToken === "string") {
            await deleteCookie("accessToken");
            await deleteCookie("refreshToken");
            return NextResponse.redirect(new URL('/login', request.url));
        }

        userRole = verifiedToken.role;
    }

    const routerOwner = getRouteOwner(pathname);
    //path = /doctor/appointments => "DOCTOR"
    //path = /my-profile => "COMMON"
    //path = /login => null

    const isAuth = isAuthRoute(pathname)

    // Rule 1 : User is logged in and trying to access auth route. Redirect to default dashboard
    if (accessToken && isAuth) {
        return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url))
    }

    // Rule 2: Handle /reset-password route BEFORE checking authentication
    // This route has two valid cases:
    // 1. User coming from email reset link (has email + token in query params)
    // 2. Authenticated user with needPasswordChange=true
    if (pathname === "/reset-password") {
        const email = request.nextUrl.searchParams.get("email");
        const token = request.nextUrl.searchParams.get("token");

        // Case 1: User has needPasswordChange (newly created admin/doctor)
        if (accessToken) {
            const userInfo = await getUserInfo();
            if (userInfo.needPasswordChange) {
                return NextResponse.next();
            }

            // User doesn't need password change and no valid token, redirect to dashboard
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url));
        }

        // Case 2: Coming from email reset link (has email and token)
        if (email && token) {
            try {
                // Verify the token
                const verifiedToken = await verifyResetPasswordToken(token);

                if (!verifiedToken.success) {
                    return NextResponse.redirect(new URL('/forgot-password?error=expired-link', request.url));
                }

                // Verify email matches token
                if (verifiedToken.success && verifiedToken.payload!.email !== email) {
                    return NextResponse.redirect(new URL('/forgot-password?error=invalid-link', request.url));
                }

                // Token and email are valid, allow access without authentication
                return NextResponse.next();
            } catch {
                // Token is invalid or expired
                return NextResponse.redirect(new URL('/forgot-password?error=expired-link', request.url));
            }
        }



        // No access token and no valid reset token, redirect to login
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }



    // Rule 3 : User is trying to access open public route
    if (routerOwner === null) {
        return NextResponse.next();
    }

    // Rule 1 & 2 for open public routes and auth routes

    if (!accessToken) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Rule 4 : User need password change

    if (accessToken) {
        const userInfo = await getUserInfo();
        if (userInfo.needPasswordChange) {
            if (pathname !== "/reset-password") {
                const resetPasswordUrl = new URL("/reset-password", request.url);
                resetPasswordUrl.searchParams.set("redirect", pathname);
                return NextResponse.redirect(resetPasswordUrl);
            }
            return NextResponse.next();
        }

        if (userInfo && !userInfo.needPasswordChange && pathname === '/reset-password') {
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url));
        }
    }

    // Rule 5 : User is trying to access common protected route
    if (routerOwner === "COMMON") {
        return NextResponse.next();
    }

    // Rule 6 : User is trying to access role based protected route
    if (routerOwner === "ADMIN" || routerOwner === "DOCTOR" || routerOwner === "PATIENT") {
        if (userRole !== routerOwner) {
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url))
        }
    }

    return NextResponse.next();
}



export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)',
    ],
}