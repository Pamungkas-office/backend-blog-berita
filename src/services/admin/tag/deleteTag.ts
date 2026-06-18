import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/db.js";
import { tags } from "../../../lib/db/schema.js";
import { CustomError } from "../../../lib/custom-error.js";

export const serviceDeleteTag = async (id: number) => {
  const [existing] = await db
    .select()
    .from(tags)
    .where(eq(tags.id, id))
    .limit(1);

  if (!existing) {
    throw new CustomError("Tag tidak ditemukan", 404);
  }

  await db.delete(tags).where(eq(tags.id, id));
};
