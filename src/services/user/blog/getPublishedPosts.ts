import { eq } from "drizzle-orm";
import { db } from "../../../lib/db/db.js";
import { posts } from "../../../lib/db/schema.js";

export const serviceGetPublishedPosts = async () => {
  const data = await db.query.posts.findMany({
    where: eq(posts.status, "published"),
    with: {
      category: true,
      author: {
        columns: { id: true, name: true },
      },
      post_tags: {
        with: {
          tag: true,
        },
      },
    },
    orderBy: (posts, { desc }) => [desc(posts.created_at)],
  });

  return data;
};
