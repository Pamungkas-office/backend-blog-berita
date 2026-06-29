import { eq, or } from "drizzle-orm";
import { db } from "../../../lib/db/db.js";
import {
  categories,
  tags,
  posts,
  post_tags,
} from "../../../lib/db/schema.js";
import { CustomError } from "../../../lib/custom-error.js";
import { generateSlug } from "../../../utils/slug.js";
import type { AiGeneratedContent } from "./generateNews.js";

export const serviceSaveGenerated = async (
  userId: number,
  data: AiGeneratedContent
) => {
  const resolvedCategoryIds: number[] = [];
  const resolvedTagIds: number[] = [];

  for (const name of data.category) {
    const slug = generateSlug(name);
    let [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    if (existing) {
      resolvedCategoryIds.push(existing.id);
    } else {
      const [inserted] = await db
        .insert(categories)
        .values({ name, slug })
        .returning();
      resolvedCategoryIds.push(inserted!.id);
    }
  }

  const uniqueTagNames = [...new Set(data.tags)];

  for (const name of uniqueTagNames) {
    const slug = generateSlug(name);
    let [existing] = await db
      .select()
      .from(tags)
      .where(eq(tags.slug, slug))
      .limit(1);

    if (existing) {
      resolvedTagIds.push(existing.id);
    } else {
      const [inserted] = await db
        .insert(tags)
        .values({ name, slug })
        .returning();
      resolvedTagIds.push(inserted!.id);
    }
  }

  const title = data.title;
  const slug = generateSlug(title);

  const [existingPost] = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);

  const finalSlug = existingPost ? `${slug}-${Date.now()}` : slug;

  const postSlug = generateSlug(finalSlug);

  let savedPost: typeof posts.$inferSelect | undefined;

  await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(posts)
      .values({
        user_id: userId,
        title,
        slug: postSlug,
        content: data.news,
        category_id: resolvedCategoryIds[0]!,
        status: "draft",
        meta_title: data.meta_title || null,
        meta_description: data.meta_description || null,
      })
      .returning();

    savedPost = inserted;

    const uniqueTagIds = [...new Set(resolvedTagIds)];

    if (uniqueTagIds.length > 0) {
      await tx.insert(post_tags).values(
        uniqueTagIds.map((tagId) => ({
          post_id: inserted!.id,
          tag_id: tagId,
        }))
      );
    }
  });

  if (!savedPost) {
    throw new CustomError("Gagal menyimpan berita", 500);
  }

  const result = await db.query.posts.findFirst({
    where: eq(posts.id, savedPost.id),
    with: {
      category: true,
      post_tags: {
        with: {
          tag: true,
        },
      },
    },
  });

  return result;
};
