import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE_NAME } from "./lib/session";

// 1. Paths that require the user to be Logged In
const PROTECTED_PATHS = [
    /^\/book\/[a-zA-Z0-9-]+\/find\/results$/, 
];

// 2. Paths that should be SKIPPED if already Logged In (The "Find" page)
const AUTH_PATHS = [
    /^\/book\/[a-zA-Z0-9-]+\/find$/,
];

export async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const hasValidSession = verifySession(req); 

    // CASE A: User is trying to access a Protected Page (Results)
    const isProtected = PROTECTED_PATHS.some(pattern => pattern.test(path));
    if (isProtected) {
        if (!hasValidSession) {
            // Not logged in? Kick them back to /find
            const slug = path.split('/')[2];
            const redirectUrl = new URL(`/book/${slug}/find`, req.url);
            
            const response = NextResponse.redirect(redirectUrl);
            // Clear any invalid cookie debris
            response.cookies.delete(SESSION_COOKIE_NAME);
            
            return response;
        }
    }

    // CASE B: User is visiting the Login Page (/find) but is ALREADY Logged In
    const isAuthPage = AUTH_PATHS.some(pattern => pattern.test(path));
    if (isAuthPage && hasValidSession) {
        // Already verified? Auto-forward to results!
        const slug = path.split('/')[2];
        const redirectUrl = new URL(`/book/${slug}/find/results`, req.url);
        
        return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/book/:slug/find/:path*',
    ],
};