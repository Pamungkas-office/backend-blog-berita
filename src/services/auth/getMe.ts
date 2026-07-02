import { eq, sql } from "drizzle-orm";
import { db } from "../../lib/db/db.js";
import { masterAdmin, users } from "../../lib/db/schema.js";
import { CustomError } from "../../lib/custom-error.js";

export const serviceGetMe = async (userId: string) => {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      email_verified_at: users.email_verified_at,
      created_at: users.created_at,
      is_approver: sql<boolean>`COALESCE(${masterAdmin.is_approver}, 0)`,
    })
    .from(users)
    .leftJoin(masterAdmin, eq(masterAdmin.user_id, users.id))
    .where(eq(users.id, Number(userId)))
    .limit(1);

  if (!result[0]) {
    throw new CustomError("User tidak ditemukan", 404);
  }

  return result[0];
};