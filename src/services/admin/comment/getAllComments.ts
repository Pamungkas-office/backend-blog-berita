import { desc, eq, count } from "drizzle-orm";
import { db } from "../../../lib/db/db.js";
import { comments, posts, users } from "../../../lib/db/schema.js";

export const serviceGetAllComments = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;

  const [totalResult] = await db
    .select({ total: count() })
    .from(comments);

  const total = totalResult?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const data = await db
    .select({
      id: comments.id,
      comment: comments.comment,
      created_at: comments.created_at,
      post: {
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
      },
      user: {
        id: users.id,
        name: users.name,
      },
    })
    .from(comments)
    .leftJoin(posts, eq(comments.post_id, posts.id))
    .leftJoin(users, eq(comments.user_id, users.id))
    .orderBy(desc(comments.created_at))
    .limit(limit)
    .offset(offset);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};
