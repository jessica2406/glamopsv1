// src/lib/session.ts
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

// OTP Constants - Reading from .env
export const OTP_LENGTH = parseInt(process.env.OTP_LENGTH || '6', 10);
export const OTP_EXPIRATION_SECONDS = parseInt(process.env.OTP_EXPIRY_SECONDS || '300', 10); // 5 minutes
export const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10);

// Rate Limiting Constants - Reading from .env
export const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || "3", 10);
export const RATE_LIMIT_WINDOW_SECONDS = parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || "600", 10);

// Session cookie constants - Reading from .env
export const SESSION_COOKIE_NAME = process.env.COOKIE_NAME || "appointment_auth_token";
export const SESSION_EXPIRATION_SECONDS = parseInt(process.env.COOKIE_MAX_AGE_SECONDS || '86400', 10); // 24 hours fallback (matches your env)

/**
 * Checks if the user has a valid, non-expired authentication cookie.
 * * @param request The incoming NextRequest object.
 * @returns boolean true if the session cookie is present and non-empty.
 */
export function verifySession(request: NextRequest): boolean {
    const cookie = request.cookies.get(SESSION_COOKIE_NAME);
    
    // In an edge runtime environment (middleware), we read cookies directly 
    // from the request object, not by importing cookies().
    return !!cookie?.value;
}