import { eq } from "drizzle-orm";
import { db } from "../../lib/db/db.js";
import { users } from "../../lib/db/schema.js";
import { CustomError } from "../../lib/custom-error.js";

export const serviceGetMe = async (userId: string) => {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      created_at: users.created_at,
    })
    .from(users)
    .where(eq(users.id, Number(userId)))
    .limit(1);

  if (!user) {
    throw new CustomError("User tidak ditemukan", 404);
  }

  return user;
};