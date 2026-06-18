import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/db.ts";
import { posts } from "../../../lib/db/schema.ts";
import { CustomError } from "../../../lib/custom-error.ts";

export const serviceGetPostById = async (id: number) => {
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!post) {
    throw new CustomError("Post tidak ditemukan", 404);
  }

  return post;
};
