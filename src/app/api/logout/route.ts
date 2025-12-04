import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "../../../lib/session";

export async function POST(req: NextRequest) {
    // Create a response
    const response = NextResponse.json({ success: true, message: "Logged out" });

    // Delete the cookie by setting it to expire immediately
    response.cookies.delete(SESSION_COOKIE_NAME);

    return response;
}