// src/app/api/get-session-email-hash/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
// FIX: Using relative import
import { SESSION_COOKIE_NAME } from "../../../lib/session";

export async function GET() {

    // FIX: cookies() must be awaited in some Next.js setups
    const cookieStore = await cookies();

    const sessionHashedEmail = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionHashedEmail) {
        return NextResponse.json({ error: "No active session found" }, { status: 401 });
    }

    return NextResponse.json({ hashedEmail: sessionHashedEmail });
}
