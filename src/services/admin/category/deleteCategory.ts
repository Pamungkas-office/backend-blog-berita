import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/db.ts";
import { categories } from "../../../lib/db/schema.ts";
import { CustomError } from "../../../lib/custom-error.ts";

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
