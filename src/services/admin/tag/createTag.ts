import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/db.ts";
import { tags } from "../../../lib/db/schema.ts";
import { CustomError } from "../../../lib/custom-error.ts";

export const serviceCreateTag = async (name: string, slug: string) => {
  const [existing] = await db
    .select()
    .from(tags)
    .where(eq(tags.slug, slug))
    .limit(1);

  if (existing) {
    throw new CustomError("Slug tag sudah digunakan", 409);
  }

  const [tag] = await db
    .insert(tags)
    .values({ name, slug })
    .returning();

  return tag;
};
