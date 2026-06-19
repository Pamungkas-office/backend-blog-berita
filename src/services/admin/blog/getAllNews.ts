import { db } from "../../../lib/db/db.js";

export const getAllNewsAdmin = async () => {
  const data = await db.query.posts.findMany({
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
  });

  return data;
};