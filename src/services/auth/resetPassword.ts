import crypto from "node:crypto";
import { eq, and, isNull, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../../lib/db/db.js";
import { users, passwordResets } from "../../lib/db/schema.js";
import { CustomError } from "../../lib/custom-error.js";

export async function serviceResetPassword(
  rawToken: string,
  newPassword: string,
): Promise<void> {
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  const now = new Date().toISOString();

  const [record] = await db
    .select({
      email: passwordResets.email,
      expiresAt: passwordResets.expiresAt,
      usedAt: passwordResets.usedAt,
    })
    .from(passwordResets)
    .where(eq(passwordResets.token, hashedToken))
    .limit(1);

  if (!record) {
    throw new CustomError("Token tidak valid", 400);
  }

  if (record.usedAt !== null) {
    throw new CustomError("Token sudah digunakan", 400);
  }

  if (record.expiresAt < now) {
    throw new CustomError("Token sudah kedaluwarsa", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, record.email));

    await tx
      .update(passwordResets)
      .set({ usedAt: now })
      .where(eq(passwordResets.token, hashedToken));
  });
}
