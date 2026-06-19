import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/db.js";
import { comments } from "../../../lib/db/schema.js";
import { CustomError } from "../../../lib/custom-error.js";

export const serviceDeleteComment = async (id: number) => {
  const [existing] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, id))
    .limit(1);

  if (!existing) {
    throw new CustomError("Komentar tidak ditemukan", 404);
  }

  await db.delete(comments).where(eq(comments.id, id));
};
