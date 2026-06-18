import { db } from "../../../lib/db/db.ts";
import { CustomError } from "../../../lib/custom-error.ts";

export const serviceGetPostBySlug = async (slug: string) => {
  const [post] = await db.query.posts.findMany({
    where: (posts, { and, eq }) =>
      and(eq(posts.slug, slug), eq(posts.status, "published")),
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
    limit: 1,
  });

  if (!post) {
    throw new CustomError("Post tidak ditemukan", 404);
  }

  return post;
};
