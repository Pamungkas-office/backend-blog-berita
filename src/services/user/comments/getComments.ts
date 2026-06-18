import { desc, eq } from "drizzle-orm";
import { db } from "../../../lib/db/db.js"
import { comments, posts } from "../../../lib/db/schema.js";

export const serviceGetComments = async(slug: string) => {
    const commentWithPost = await db.select({
        id: comments.id, 
        comment: comments.comment, 
        created_at: comments.created_at, 
        post_id: comments.post_id
    })
    .from(comments) 
    .innerJoin(posts, eq(comments.post_id, posts.id))
    .where(eq(posts.slug, slug))
    .orderBy(desc(comments.created_at))
    .limit(10)

    return commentWithPost; 
}