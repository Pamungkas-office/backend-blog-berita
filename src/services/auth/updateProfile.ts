import { eq } from "drizzle-orm";
import { db } from "../../lib/db/db.ts";
import { users } from "../../lib/db/schema.ts";
import { CustomError } from "../../lib/custom-error.ts";

export const serviceUpdateProfile = async (
  userId: string,
  name?: string,
  email?: string,
) => {
  if (email) {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser && String(existingUser.id) !== userId) {
      throw new CustomError("Email sudah digunakan user lain", 409);
    }
  }

  const data: Record<string, string> = {};
  if (name) data.name = name;
  if (email) data.email = email;

  const [user] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, Number(userId)))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      created_at: users.created_at,
    });

  return user;
};