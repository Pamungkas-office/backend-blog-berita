import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/db.ts";
import { comments } from "../../../lib/db/schema.ts";
import { CustomError } from "../../../lib/custom-error.ts";

export const serviceDeleteComment = async (
  commentId: number,
  userId: number,
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
    throw new CustomError("Anda tidak memiliki akses untuk menghapus komentar ini", 403);
  }

  await db.delete(comments).where(eq(comments.id, commentId));

  return { id: commentId };
};
