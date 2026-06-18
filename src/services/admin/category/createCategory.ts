import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/db.js";
import { categories } from "../../../lib/db/schema.js";
import { CustomError } from "../../../lib/custom-error.js";

export const serviceCreateCategory = async (name: string, slug: string) => {
  const [existing] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (existing) {
    throw new CustomError("Slug kategori sudah digunakan", 409);
  }

  const [category] = await db
    .insert(categories)
    .values({ name, slug })
    .returning();

  return category;
};
