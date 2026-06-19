import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/db.js";
import { tags } from "../../../lib/db/schema.js";
import { CustomError } from "../../../lib/custom-error.js";

export const serviceUpdateTag = async (id: number, name: string, slug: string) => {
  const [existing] = await db
    .select()
    .from(tags)
    .where(eq(tags.id, id))
    .limit(1);

  if (!existing) {
    throw new CustomError("Tag tidak ditemukan", 404);
  }

  const [duplicate] = await db
    .select()
    .from(tags)
    .where(eq(tags.slug, slug))
    .limit(1);

  if (duplicate && duplicate.id !== id) {
    throw new CustomError("Slug tag sudah digunakan", 409);
  }

  const [tag] = await db
    .update(tags)
    .set({ name, slug })
    .where(eq(tags.id, id))
    .returning();

  return tag;
};
