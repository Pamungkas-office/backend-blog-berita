import { and, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { db } from "../../../lib/db/db.js";
import { page_views, posts } from "../../../lib/db/schema.js";

interface RecordViewParams {
  postId: number;
  userId?: number | null;
  visitorId: string;
}

export const recordPageView = async ({ postId, userId, visitorId }: RecordViewParams) => {
  if (userId) {
    const byUser = await db
      .select({ id: page_views.id })
      .from(page_views)
      .where(and(eq(page_views.post_id, postId), eq(page_views.user_id, userId)))
      .limit(1);

    if (byUser.length > 0) return;

    const byVisitor = await db
      .select({ id: page_views.id })
      .from(page_views)
      .where(
        and(
          eq(page_views.post_id, postId),
          eq(page_views.visitor_id, visitorId),
          isNull(page_views.user_id),
        ),
      )
      .limit(1);

    const visitorRecord = byVisitor[0];
    if (visitorRecord) {
      await db
        .update(page_views)
        .set({ user_id: userId })
        .where(eq(page_views.id, visitorRecord.id));
      return;
    }
  } else {
    const existing = await db
      .select({ id: page_views.id })
      .from(page_views)
      .where(and(eq(page_views.post_id, postId), eq(page_views.visitor_id, visitorId)))
      .limit(1);

    if (existing.length > 0) return;
  }

  await db.insert(page_views).values({
    post_id: postId,
    user_id: userId ?? undefined,
    visitor_id: visitorId,
  });
};

export const getViewCount = async (postId: number): Promise<number> => {
  const [result] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(page_views)
    .where(eq(page_views.post_id, postId));

  return Number(result?.count ?? 0);
};

export const getTotalViews = async (): Promise<number> => {
  const [result] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(page_views);

  return Number(result?.count ?? 0);
};

export const getViewsPerPost = async (postIds: number[]): Promise<Record<number, number>> => {
  if (postIds.length === 0) return {};

  const rows = await db
    .select({
      postId: page_views.post_id,
      count: sql<number>`COUNT(*)`,
    })
    .from(page_views)
    .where(inArray(page_views.post_id, postIds))
    .groupBy(page_views.post_id);

  const map: Record<number, number> = {};
  for (const row of rows) {
    map[row.postId] = Number(row.count);
  }
  return map;
};

export const getPostIdBySlug = async (slug: string): Promise<number | null> => {
  const [post] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
    .limit(1);

  return post?.id ?? null;
};
