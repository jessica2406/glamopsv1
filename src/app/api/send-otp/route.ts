import { NextRequest, NextResponse } from "next/server";
import { firestore } from "../../../lib/firebaseAdmin";
import { hashOtp, hashEmail } from "../../../lib/crypto";
import { sendOtpEmail } from "../../../lib/email"; // ✅ Uncommented
import crypto from "crypto";
import { OTP_LENGTH, OTP_EXPIRATION_SECONDS, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_SECONDS } from "../../../lib/session";

// Force Node.js runtime (Firebase Admin is incompatible with Edge)
export const runtime = 'nodejs'; 

// Helper to handle mixed timestamp formats (Numbers vs Firestore Objects)
function parseTimestamp(t: any): number {
  if (typeof t === 'number') return t;
  if (t && typeof t.toMillis === 'function') return t.toMillis();
  if (t && t._seconds) return t._seconds * 1000;
  return 0;
}

function generateNumericOtp(len: number) {
  const min = Math.pow(10, len - 1);
  const max = Math.pow(10, len) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email; 
  
  const maskedLocal =
    local.length <= 2
      ? local[0] + "*"
      : local[0] + "*".repeat(Math.max(1, local.length - 2)) + local.slice(-1);
  
  const parts = domain.split(".");
  if (parts.length < 2) return `${maskedLocal}@${domain}`;

  const maskedDomain =
    parts[0].length <= 2
      ? parts[0][0] + "*"
      : parts[0][0] +
        "*".repeat(Math.max(1, parts[0].length - 2)) +
        parts[0].slice(-1);
  
  return `${maskedLocal}@${maskedDomain}.${parts.slice(1).join(".")}`;
}

export async function POST(req: NextRequest) {
  console.log("🚀 API /api/send-otp hit");

  try {
    const body = await req.json();
    const email = (body?.email || "").trim().toLowerCase();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid or missing email" },
        { status: 400 }
      );
    }

    const docId = hashEmail(email);
    const docRef = firestore.collection("email_otps").doc(docId);
    const now = new Date();

    // --- TRANSACTION START ---
    const txResult = await firestore.runTransaction(async (tx) => {
      const snap = await tx.get(docRef);
      let requestTimestamps: number[] = [];
      
      if (snap.exists) {
        const d = snap.data() || {};
        // Fix: Handle mixed types correctly
        requestTimestamps = (Array.isArray(d.requestTimestamps) ? d.requestTimestamps : [])
          .map(parseTimestamp) 
          .filter((t: number) => t > 0);
      }

      // Prune old timestamps
      const cutoff = Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000;
      requestTimestamps = requestTimestamps.filter(ts => ts > cutoff);

      if (requestTimestamps.length >= RATE_LIMIT_MAX) {
        return { allowed: false };
      }

      const otp = generateNumericOtp(OTP_LENGTH);
      const salt = crypto.randomBytes(8).toString("hex");
      const otpHash = hashOtp(otp, salt);
      const expiresAt = new Date(Date.now() + OTP_EXPIRATION_SECONDS * 1000);

      requestTimestamps.push(now.getTime());

      tx.set(
        docRef,
        {
          hashedEmail: docId,
          emailHint: maskEmail(email),
          otpHash,
          salt,
          createdAt: now,
          expiresAt,
          attempts: 0,
          requestTimestamps,
          lastSentAt: now,
        },
        { merge: true }
      );

      return { allowed: true, otp };
    });
    // --- TRANSACTION END ---

    if (!txResult.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    // ✅ SEND EMAIL
    try {
      console.log(`📧 Attempting to send email to ${maskEmail(email)}...`);
      await sendOtpEmail(email, txResult.otp!, OTP_EXPIRATION_SECONDS);
      console.log("✅ Email sent successfully via SendGrid");
    } catch (e: any) {
      console.error("❌ SendGrid Error:", e.response?.body || e.message);
      // We return 500 here so the frontend knows the email failed
      return NextResponse.json(
        { error: "OTP generated but failed to send email." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, message: "OTP sent" });

  } catch (err: any) {
    console.error("🔥 CRITICAL SERVER ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}