import crypto from "node:crypto";
import { eq, and, isNull, lt } from "drizzle-orm";
import { db } from "../../lib/db/db.js";
import { users, passwordResets } from "../../lib/db/schema.js";

export async function serviceForgotPassword(email: string): Promise<string> {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return "";
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

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

  return rawToken;
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
