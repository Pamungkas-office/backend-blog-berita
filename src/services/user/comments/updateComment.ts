import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/db.js";
import { comments } from "../../../lib/db/schema.js";
import { CustomError } from "../../../lib/custom-error.js";

export const serviceUpdateComment = async (
  commentId: number,
  userId: number,
  commentText: string,
) => {
  const [existingComment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);

  if (!existingComment) {
    throw new CustomError("Komentar tidak ditemukan", 404);
  }

  if (existingComment.user_id !== userId) {
    throw new CustomError("Anda tidak memiliki akses untuk mengubah komentar ini", 403);
  }

  if (!commentText) {
    throw new CustomError("Komentar tidak boleh kosong", 400);
  }

  const [updatedComment] = await db
    .update(comments)
    .set({ comment: commentText })
    .where(eq(comments.id, commentId))
    .returning();

  return updatedComment;
};
