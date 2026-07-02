import { and, eq, sql } from "drizzle-orm";
import { db } from "../../../lib/db/db.js";
import { posts } from "../../../lib/db/schema.js";
import { getViewsPerPost } from "../../user/blog/pageView.service.js";

export const getAllNewsAdmin = async (
  userId?: number,
  isSuperAdmin?: boolean,
  page?: number,
  limit?: number,
  status?: "draft" | "waiting_approval" | "approved" | "revision" | "published",
) => {
  const filters: any[] = [];
  if (!isSuperAdmin && userId) filters.push(eq(posts.user_id, userId));
  if (status) filters.push(eq(posts.status, status));

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(posts)
    .where(whereClause);

  const totalCount = Number(countResult?.count ?? 0);

  const data = await db.query.posts.findMany({
    where: whereClause,
    with: {
      category: true,
      author: {
        columns: { id: true, name: true, email: true },
      },
      post_tags: {
        with: {
          tag: true,
        },
      },
    },
    orderBy: (posts, { desc }) => [desc(posts.created_at)],
    ...(page && limit ? { limit, offset: (page - 1) * limit } : {}),
  });

  const postIds = data.map((p) => p.id);
  const viewsMap = await getViewsPerPost(postIds);

  const mappedData = data.map((post) => ({
    ...post,
    view_count: viewsMap[post.id] ?? 0,
  }));

  return {
    data: mappedData,
    pagination:
      page && limit
        ? {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
          }
        : null,
  };
};