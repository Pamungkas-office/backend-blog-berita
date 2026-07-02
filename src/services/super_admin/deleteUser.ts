import { eq } from "drizzle-orm";
import { db } from "../../lib/db/db.js";
import { posts, users } from "../../lib/db/schema.js";
import { CustomError } from "../../lib/custom-error.js";

export const serviceDeleteUser = async (userId: number) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new CustomError("User tidak ditemukan", 404);
  if (user.role === "super_admin") {
    throw new CustomError("Tidak dapat menghapus Super Admin", 400);
  }

  await db.delete(posts).where(eq(posts.user_id, userId));

  await db.delete(users).where(eq(users.id, userId));

  return { deleted: true };
};
