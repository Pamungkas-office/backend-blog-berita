import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../lib/db/db.js";
import { users } from "../../lib/db/schema.js";
import { CustomError } from "../../lib/custom-error.js";

export async function serviceVerifyEmail(rawToken: string): Promise<void> {
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const [user] = await db
    .select({
      id: users.id,
      email_verified_at: users.email_verified_at,
      email_verification_expires_at: users.email_verification_expires_at,
    })
    .from(users)
    .where(eq(users.email_verification_token, hashedToken))
    .limit(1);

  if (!user) {
    throw new CustomError("Token verifikasi tidak valid", 400);
  }

  if (user.email_verified_at !== null) {
    throw new CustomError("Email sudah diverifikasi sebelumnya", 400);
  }

  if (
    user.email_verification_expires_at &&
    user.email_verification_expires_at < new Date().toISOString()
  ) {
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
}
