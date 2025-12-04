import { NextRequest, NextResponse } from "next/server";
import { firestore } from "../../../lib/firebaseAdmin";
import { hashEmail, hashOtp, safeCompare } from "../../../lib/crypto";
import { SESSION_COOKIE_NAME, SESSION_EXPIRATION_SECONDS, OTP_MAX_ATTEMPTS } from "../../../lib/session";

export async function POST(req: NextRequest) {
    const now = Date.now();

    try {
        const { email, otp } = await req.json();
        if (!email || !otp) {
            return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const hashedEmail = hashEmail(normalizedEmail);
        
        const docRef = firestore.collection("email_otps").doc(hashedEmail);

        const verificationResult = await firestore.runTransaction(async (tx) => {
            const snap = await tx.get(docRef);

            if (!snap.exists) {
                return { success: false, reason: "Invalid or expired OTP session" };
            }

            const sessionData = snap.data();
            const expiresAtMs = sessionData?.expiresAt?.toMillis ? sessionData.expiresAt.toMillis() : 0;
            const currentAttempts = sessionData?.attempts || 0;
            const storedHash = sessionData?.otpHash;
            const storedSalt = sessionData?.salt;

            if (expiresAtMs < now) {
                tx.delete(docRef);
                return { success: false, reason: "OTP expired" };
            }

            if (currentAttempts >= OTP_MAX_ATTEMPTS) {
                tx.delete(docRef);
                return { success: false, reason: "Maximum attempts reached." };
            }

            const hashedInputOtp = hashOtp(otp, storedSalt);

            if (!safeCompare(hashedInputOtp, storedHash)) {
                tx.update(docRef, { attempts: currentAttempts + 1 });
                return { success: false, reason: "Invalid OTP" };
            }

            tx.delete(docRef);
            return { success: true };
        });

        if (!verificationResult.success) {
            return NextResponse.json({ error: verificationResult.reason }, { status: 401 });
        }

        const res = NextResponse.json({ success: true, message: "OTP verified" });

        // ✅ SECURITY FIX: Store the ACTUAL email, not the hash.
        // This allows the server to query Firestore for this email later.
        res.cookies.set(SESSION_COOKIE_NAME, normalizedEmail, {
            httpOnly: true, // JavaScript cannot read this (Secure)
            secure: process.env.NODE_ENV === "production",
            maxAge: SESSION_EXPIRATION_SECONDS,
            path: "/",
            sameSite: "strict",
        });

        return res;

    } catch (error) {
        console.error("API Error in verify-otp:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}