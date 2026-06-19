import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/db.js";
import { categories } from "../../../lib/db/schema.js";
import { CustomError } from "../../../lib/custom-error.js";

export const serviceUpdateCategory = async (id: number, name: string, slug: string) => {
  const [existing] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  if (!existing) {
    throw new CustomError("Kategori tidak ditemukan", 404);
  }

  const [duplicate] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (duplicate && duplicate.id !== id) {
    throw new CustomError("Slug kategori sudah digunakan", 409);
  }

  const [category] = await db
    .update(categories)
    .set({ name, slug })
    .where(eq(categories.id, id))
    .returning();

  return category;
};
