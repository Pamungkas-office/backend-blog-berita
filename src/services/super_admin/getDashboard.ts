import { eq, sql } from "drizzle-orm";
import { db } from "../../lib/db/db.js";
import { logApprovals, posts, users } from "../../lib/db/schema.js";

export const serviceGetDashboard = async () => {
  const [userCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users);
  const [adminCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .where(eq(users.role, "admin"));
  const [superAdminCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .where(eq(users.role, "super_admin"));

  const [postCounts] = await db
    .select({
      total: sql<number>`COUNT(*)`,
      draft: sql<number>`SUM(CASE WHEN ${posts.status} = 'draft' THEN 1 ELSE 0 END)`,
      waiting_approval: sql<number>`SUM(CASE WHEN ${posts.status} = 'waiting_approval' THEN 1 ELSE 0 END)`,
      approved: sql<number>`SUM(CASE WHEN ${posts.status} = 'approved' THEN 1 ELSE 0 END)`,
      revision: sql<number>`SUM(CASE WHEN ${posts.status} = 'revision' THEN 1 ELSE 0 END)`,
      published: sql<number>`SUM(CASE WHEN ${posts.status} = 'published' THEN 1 ELSE 0 END)`,
    })
    .from(posts);

  const recentActivity = await db.query.logApprovals.findMany({
    with: {
      post: {
        columns: { id: true, title: true },
      },
      approver: { columns: { id: true, name: true } },
    },
    orderBy: (la, { desc }) => [desc(la.created_at)],
    limit: 10,
  });

  return {
    users: {
      total: userCount?.count ?? 0,
      admins: adminCount?.count ?? 0,
      super_admins: superAdminCount?.count ?? 0,
    },
    posts: {
      total: postCounts?.total ?? 0,
      draft: postCounts?.draft ?? 0,
      waiting_approval: postCounts?.waiting_approval ?? 0,
      approved: postCounts?.approved ?? 0,
      revision: postCounts?.revision ?? 0,
      published: postCounts?.published ?? 0,
    },
    recent_activity: recentActivity,
  };
};
