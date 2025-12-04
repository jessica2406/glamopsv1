// src/lib/crypto.ts
import crypto from "crypto";

const OTP_SECRET = process.env.JWT_SECRET || "fallback-secret";

export function hashOtp(otp: string, salt = ""): string {
  const hmac = crypto.createHmac("sha256", OTP_SECRET);
  hmac.update(salt);
  hmac.update(otp);
  return hmac.digest("hex");
}

export function hashEmail(email: string): string {
  return crypto.createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

export function safeCompare(a: string, b: string): boolean {
  // constant-time compare
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // make lengths equal for timingSafeEqual but fail afterwards
    const len = Math.max(bufA.length, bufB.length);
    const paddedA = Buffer.concat([bufA, Buffer.alloc(len - bufA.length)]);
    const paddedB = Buffer.concat([bufB, Buffer.alloc(len - bufB.length)]);
    return crypto.timingSafeEqual(paddedA, paddedB) && false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}
