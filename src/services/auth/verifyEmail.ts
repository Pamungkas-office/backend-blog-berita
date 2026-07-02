import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../lib/db/db.js";
import { users } from "../../lib/db/schema.js";
import { CustomError } from "../../lib/custom-error.js";

export async function serviceVerifyEmail(rawToken: string): Promise<boolean> {
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  console.log("[VERIFY] rawToken from URL:", rawToken);
  console.log("[VERIFY] hashedToken computed:", hashedToken);

  const [user] = await db
    .select({
      id: users.id,
      email_verified_at: users.email_verified_at,
      email_verification_token: users.email_verification_token,
      email_verification_expires_at: users.email_verification_expires_at,
    })
    .from(users)
    .where(eq(users.email_verification_token, hashedToken))
    .limit(1);

  console.log("[VERIFY] User found:", !!user);
  if (user) {
    console.log("[VERIFY] User ID:", user.id);
    console.log("[VERIFY] Email already verified:", user.email_verified_at !== null);
    console.log("[VERIFY] Token expired:", user.email_verification_expires_at
      ? user.email_verification_expires_at < new Date().toISOString()
      : "no expiry set");
  }

  if (!user) {
    console.log("[VERIFY] Token not found — already used or invalid");
    return false;
  }

  if (user.email_verified_at !== null) {
    console.log("[VERIFY] Email already verified previously");
    return false;
  }

  if (
    user.email_verification_expires_at &&
    user.email_verification_expires_at < new Date().toISOString()
  ) {
    console.log("[VERIFY] Token expired");
    throw new CustomError(
      "Token verifikasi sudah kedaluwarsa. Silakan minta link verifikasi baru.",
      400,
    );
  }

  const now = new Date().toISOString();

  await db
    .update(users)
    .set({
      email_verified_at: now,
      email_verification_token: null,
      email_verification_expires_at: null,
    })
    .where(eq(users.id, user.id));

  console.log("[VERIFY] Email verified successfully for user:", user.id);
  return true;
}
