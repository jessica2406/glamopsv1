import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "../../../lib/session";

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    // Check if the secure HTTP-Only cookie exists
    const email = req.cookies.get(SESSION_COOKIE_NAME)?.value;

    // Return the email (or null if guest)
    return NextResponse.json({ 
        isAuthenticated: !!email,
        email: email || null 
    });
}