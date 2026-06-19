import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/db.js";
import { categories, post_tags, posts } from "../../../lib/db/schema.js";
import { CustomError } from "../../../lib/custom-error.js";
import { MediaService } from "../../../lib/upload.js";

export const serviceCreatePost = async (
  userId: number,
  data: {
    title: string;
    slug: string;
    content: string;
    category_id: number;
    status: "draft" | "published";
    meta_title?: string | null;
    meta_description?: string | null;
    tag_ids?: number[];
  },
  file: Express.Multer.File | undefined
) => {
  const [existing] = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, data.slug))
    .limit(1);

  if (existing) {
    throw new CustomError("Slug post sudah digunakan", 409);
  }

  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, data.category_id))
    .limit(1);

  if (!category) {
    throw new CustomError("Kategori tidak ditemukan", 404);
  }

  const thumbnailUrl = await MediaService.uploadThumbnail(file);

  const inserted = await db
    .insert(posts)
    .values({
      user_id: userId,
      title: data.title,
      slug: data.slug,
      content: data.content,
      category_id: data.category_id,
      status: data.status,
      thumbnail: thumbnailUrl,
      meta_title: data.meta_title || null,
      meta_description: data.meta_description || null,
    })
    .returning();

  const post = inserted[0]!;

  if (data.tag_ids && data.tag_ids.length > 0) {
    await db.insert(post_tags).values(
      data.tag_ids.map((tag_id) => ({ post_id: post.id, tag_id })),
    );
  }

  return post;
};
