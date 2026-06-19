import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/db.js";
import { categories } from "../../../lib/db/schema.js";
import { CustomError } from "../../../lib/custom-error.js";

export const serviceDeleteCategory = async (id: number) => {
  const [existing] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  if (!existing) {
    throw new CustomError("Kategori tidak ditemukan", 404);
  }

  await db.delete(categories).where(eq(categories.id, id));
};
