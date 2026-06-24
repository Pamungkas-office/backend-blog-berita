import crypto from "node:crypto";
import { eq, and, isNull, lt, gte, desc } from "drizzle-orm";
import { db } from "../../lib/db/db.js";
import { users, passwordResets } from "../../lib/db/schema.js";
import { CustomError } from "../../lib/custom-error.js";
import { sendResetPasswordEmail } from "../email/emailService.js";

export async function serviceForgotPassword(email: string): Promise<boolean> {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return false;
  }

  const thirtyMinutesAgo = new Date(
    Date.now() - 30 * 60 * 1000,
  ).toISOString();

  const [recentToken] = await db
    .select({ createdAt: passwordResets.createdAt })
    .from(passwordResets)
    .where(
      and(
        eq(passwordResets.email, email),
        gte(passwordResets.createdAt, thirtyMinutesAgo),
        isNull(passwordResets.usedAt),
      ),
    )
    .orderBy(desc(passwordResets.createdAt))
    .limit(1);

  if (recentToken) {
    throw new CustomError(
      "Silakan tunggu 30 menit sebelum meminta ulang link reset password",
      429,
    );
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  // Kirim email SEBELUM menyimpan token
  // Jika gagal, throw error — token tidak pernah tersimpan
  try {
    await sendResetPasswordEmail(email, rawToken);
  } catch {
    throw new CustomError(
      "Gagal mengirim email. Silakan coba lagi.",
      500,
    );
  }

  await db.transaction(async (tx) => {
    await tx
      .delete(passwordResets)
      .where(
        and(
          eq(passwordResets.email, email),
          isNull(passwordResets.usedAt),
        ),
      );

    await tx.insert(passwordResets).values({
      email,
      token: hashedToken,
      expiresAt,
    });
  });

  return true;
}

export async function cleanupExpiredTokens(): Promise<void> {
  await db
    .delete(passwordResets)
    .where(
      and(
        lt(passwordResets.expiresAt, new Date().toISOString()),
        isNull(passwordResets.usedAt),
      ),
    );
}
