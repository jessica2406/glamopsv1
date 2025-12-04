import sgMail from "@sendgrid/mail";

// Store a flag to indicate if SendGrid initialization was successful
let isSendGridInitialized = false;

if (process.env.SENDGRID_API_KEY) {
  try {
    // Ensuring the key is trimmed to remove any accidental spaces from .env.local
    sgMail.setApiKey(process.env.SENDGRID_API_KEY.trim());
    isSendGridInitialized = true;
    console.log("SendGrid initialized successfully.");
  } catch (e) {
    console.error("SENDGRID INITIALIZATION ERROR: Failed to set API key.", e);
  }
} else {
  console.warn("SENDGRID_API_KEY environment variable is not set. Email sending will fail.");
}

export async function sendOtpEmail(to: string, otp: string, expiresSeconds: number) {
  if (!isSendGridInitialized) {
    throw new Error("SendGrid is not initialized. Check SENDGRID_API_KEY.");
  }

  const from = process.env.EMAIL_FROM || "no-reply@example.com";
  if (!from || from === "no-reply@example.com") {
    throw new Error("EMAIL_FROM is not set or is using the default placeholder.");
  }
  
  const expiresMinutes = Math.ceil(expiresSeconds / 60);
  const subject = "Your verification code";
  const text = `Your verification code is ${otp}. It expires in ${expiresMinutes} minute(s). Do not share this code.`;
  const html = `<p>Your verification code is <strong>${otp}</strong>.</p><p>It will expire in ${expiresMinutes} minute(s).</p>`;

  const msg = {
    to,
    from,
    subject,
    text,
    html,
  };

  // send and bubble up errors
  return sgMail.send(msg);
}