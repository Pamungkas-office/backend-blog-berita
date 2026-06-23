import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../../lib/db/db.js";
import { users } from "../../lib/db/schema.js";
import { CustomError } from "../../lib/custom-error.js";

export async function serviceChangePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ email: string; name: string }> {
  const [user] = await db
    .select({ password: users.password, email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, Number(userId)))
    .limit(1);

  if (!user) {
    throw new CustomError("User tidak ditemukan", 404);
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    throw new CustomError("Password saat ini tidak cocok", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, Number(userId)));

  return {
    email: user.email,
    name: user.name,
  };
}
