import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/db.js";
import { posts } from "../../../lib/db/schema.js";
import { CustomError } from "../../../lib/custom-error.js";

export const serviceGetPostById = async (id: number) => {
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: {
      category: true,
      post_tags: {
        with: {
          tag: true,
        },
      },
    },
  });

  if (!post) {
    throw new CustomError("Post tidak ditemukan", 404);
  }

  return post;
};
