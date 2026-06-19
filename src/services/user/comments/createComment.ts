import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/db.js";
import { CustomError } from "../../../lib/custom-error.js";
import { comments } from "../../../lib/db/schema.js";

export const serviceCreateComment = async (
  userId: number,
  slug: string,
  comment: any,
) => {
  // Mendapatkan postingan berdasarkan slug
  const post = await db.query.posts.findFirst({
    where: (post, { eq }) => eq(post.slug, slug),
  });

  if (!post) {
    throw new CustomError("Postingan tidak ditemukan", 404);
  }

  if (!comment) {
    throw new CustomError("Komentar tidak boleh kosong", 400);
  }

  const newComment = await db
    .insert(comments)
    .values({
      post_id: post.id,
      user_id: userId,
      comment: comment,
    })
    .returning();

  if (newComment.length === 0) {
    throw new CustomError(
      "Gagal memberikan komentar, pastikan login terlebih dahulu",
      400,
    );
  }

  return newComment[0];
};
