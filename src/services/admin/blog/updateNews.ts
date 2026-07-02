import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/db.js";
import { post_tags, posts } from "../../../lib/db/schema.js";
import { CustomError } from "../../../lib/custom-error.js";

export const serviceUpdatePost = async (
  id: number,
  data: {
    title?: string;
    slug?: string;
    content?: string;
    category_id?: number;
    status?: "draft" | "waiting_approval";
    thumbnail?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    tag_ids?: number[];
  },
  context?: { isSuperAdmin: boolean; userId: number },
) => {
  const [existing] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!existing) {
    throw new CustomError("Post tidak ditemukan", 404);
  }

  // Permission check: non-super-admin can only edit draft / waiting_approval / revision posts
  if (context && !context.isSuperAdmin) {
    if (!["draft", "waiting_approval", "revision"].includes(existing.status)) {
      throw new CustomError(
        "Anda tidak dapat mengedit post dengan status ini",
        403,
      );
    }

    // Only the creator can edit
    if (existing.user_id !== context.userId) {
      throw new CustomError("Anda hanya dapat mengedit post milik sendiri", 403);
    }
  }

  if (data.slug && data.slug !== existing.slug) {
    const [duplicate] = await db
      .select()
      .from(posts)
      .where(eq(posts.slug, data.slug))
      .limit(1);

    if (duplicate) {
      throw new CustomError("Slug post sudah digunakan", 409);
    }
  }

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.category_id !== undefined) updateData.category_id = data.category_id;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
  if (data.meta_title !== undefined) updateData.meta_title = data.meta_title || null;
  if (data.meta_description !== undefined) updateData.meta_description = data.meta_description || null;

  const updated = await db
    .update(posts)
    .set(updateData)
    .where(eq(posts.id, id))
    .returning();

  const post = updated[0]!;

  if (data.tag_ids !== undefined) {
    await db.delete(post_tags).where(eq(post_tags.post_id, id));

    const uniqueTagIds = [...new Set(data.tag_ids)];

    if (uniqueTagIds.length > 0) {
      await db.insert(post_tags).values(
        uniqueTagIds.map((tag_id) => ({ post_id: id, tag_id })),
      );
    }
  }

  return post;
};