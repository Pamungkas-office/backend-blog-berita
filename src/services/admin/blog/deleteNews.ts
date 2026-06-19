import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/db.js";
import { posts } from "../../../lib/db/schema.js";
import { CustomError } from "../../../lib/custom-error.js";

export const serviceDeletePost = async (id: number) => {
  const [existing] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!existing) {
    throw new CustomError("Post tidak ditemukan", 404);
  }

  await db.delete(posts).where(eq(posts.id, id));
};