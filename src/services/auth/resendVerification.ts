import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../lib/db/db.js";
import { users } from "../../lib/db/schema.js";
import { CustomError } from "../../lib/custom-error.js";
import { sendVerificationEmail } from "../email/emailService.js";

export async function serviceResendVerification(email: string): Promise<void> {
  const [user] = await db
    .select({
      id: users.id,
      email_verified_at: users.email_verified_at,
      email_verification_expires_at: users.email_verification_expires_at,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return;
  }

  if (user.email_verified_at !== null) {
    throw new CustomError("Email sudah diverifikasi", 400);
  }

  // Cek apakah ada token yang masih berlaku (belum expired)
  if (
    user.email_verification_expires_at &&
    user.email_verification_expires_at > new Date().toISOString()
  ) {
    throw new CustomError(
      "Link verifikasi sebelumnya masih berlaku. Silakan cek email Anda.",
      429,
    );
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  const expiresAt = new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  ).toISOString();

  try {
    await sendVerificationEmail(email, rawToken);
  } catch {
    throw new CustomError(
      "Gagal mengirim email verifikasi. Silakan coba lagi.",
      500,
    );
  }

  await db
    .update(users)
    .set({
      email_verification_token: hashedToken,
      email_verification_expires_at: expiresAt,
    })
    .where(eq(users.id, user.id));
}
