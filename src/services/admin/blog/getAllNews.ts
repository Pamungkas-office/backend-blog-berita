import { db } from "../../../lib/db/db.js";
import { getViewsPerPost } from "../../user/blog/pageView.service.js";

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

  const postIds = data.map((p) => p.id);
  const viewsMap = await getViewsPerPost(postIds);

  return data.map((post) => ({
    ...post,
    view_count: viewsMap[post.id] ?? 0,
  }));
};