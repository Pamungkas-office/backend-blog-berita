import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "../../../lib/db/db.js";
import {
  approvalConfig,
  logApprovals,
  masterAdmin,
  posts,
  users,
} from "../../../lib/db/schema.js";
import { CustomError } from "../../../lib/custom-error.js";

// ─────────────────────────────────────────────
// 1. APPROVE a post
// ─────────────────────────────────────────────
export const serviceApprovePost = async (
  postId: number,
  approverId: number,
) => {
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) throw new CustomError("Post tidak ditemukan", 404);
  if (post.status !== "waiting_approval") {
    throw new CustomError(
      "Hanya post dengan status waiting_approval yang bisa di-approve",
      400,
    );
  }

  // Check if this user already approved this post
  const [existing] = await db
    .select()
    .from(logApprovals)
    .where(
      and(
        eq(logApprovals.post_id, postId),
        eq(logApprovals.approver_id, approverId),
        eq(logApprovals.action, 1),
        eq(logApprovals.is_active, true),
      ),
    )
    .limit(1);

  if (existing) {
    throw new CustomError("Anda sudah melakukan approve post ini", 400);
  }

  // Insert approval log
  await db.insert(logApprovals).values({
    post_id: postId,
    approver_id: approverId,
    action: 1,
    is_active: true,
  });

  // Count active approvers (super_admin OR admin with is_approver = true)
  const adminApprovals = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(logApprovals)
    .where(
      and(
        eq(logApprovals.post_id, postId),
        eq(logApprovals.action, 1),
        eq(logApprovals.is_active, true),
        inArray(
          logApprovals.approver_id,
          db
            .select({ id: users.id })
            .from(users)
            .where(
              or(
                eq(users.role, "super_admin"),
                inArray(
                  users.id,
                  db
                    .select({ user_id: masterAdmin.user_id })
                    .from(masterAdmin)
                    .where(eq(masterAdmin.is_approver, true)),
                ),
              ),
            ),
        ),
      ),
    );

  // Count super_admin approvals
  const superAdminApprovals = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(logApprovals)
    .where(
      and(
        eq(logApprovals.post_id, postId),
        eq(logApprovals.action, 1),
        eq(logApprovals.is_active, true),
        inArray(
          logApprovals.approver_id,
          db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.role, "super_admin")),
        ),
      ),
    );

  // Get min admin approvals config
  const [config] = await db
    .select()
    .from(approvalConfig)
    .limit(1);

  const minAdminApprovals = config?.min_admin_approvals ?? 2;
  const adminCount = Number(adminApprovals[0]?.count ?? 0);
  const superAdminCount = Number(superAdminApprovals[0]?.count ?? 0);

  // Only promote to "approved" when:
  // 1. At least 1 super_admin has approved AND
  // 2. At least minAdminApprovals total approvers (super_admin + admin is_approver) have approved
  if (superAdminCount >= 1 && adminCount >= minAdminApprovals) {
    await db
      .update(posts)
      .set({ status: "approved" })
      .where(eq(posts.id, postId));
  }

  return { approved: true, adminCount, superAdminCount, minAdminApprovals };
};

// ─────────────────────────────────────────────
// 2. REQUEST REVISION on a post
// ─────────────────────────────────────────────
export const serviceRevisionPost = async (
  postId: number,
  approverId: number,
  notes: string,
) => {
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) throw new CustomError("Post tidak ditemukan", 404);
  if (post.status !== "waiting_approval") {
    throw new CustomError(
      "Hanya post dengan status waiting_approval yang bisa di-revision",
      400,
    );
  }

  // Deactivate previous active log entries for this post
  await db
    .update(logApprovals)
    .set({ is_active: false })
    .where(
      and(
        eq(logApprovals.post_id, postId),
        eq(logApprovals.is_active, true),
      ),
    );

  // Insert revision log
  await db.insert(logApprovals).values({
    post_id: postId,
    approver_id: approverId,
    action: 0,
    notes,
    is_active: true,
  });

  // Update post status to revision
  await db
    .update(posts)
    .set({ status: "revision" })
    .where(eq(posts.id, postId));

  return { revision: true };
};

// ─────────────────────────────────────────────
// 3. PUBLISH a post  (super_admin only)
// ─────────────────────────────────────────────
export const servicePublishPost = async (postId: number) => {
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) throw new CustomError("Post tidak ditemukan", 404);
  if (post.status !== "approved") {
    throw new CustomError(
      "Hanya post dengan status approved yang bisa di-publish",
      400,
    );
  }

  await db
    .update(posts)
    .set({
      status: "published",
      published_at: sql`(CURRENT_TIMESTAMP)`,
    })
    .where(eq(posts.id, postId));

  return { published: true };
};

// ─────────────────────────────────────────────
// 4. RESUBMIT — admin resends a revised post
// ─────────────────────────────────────────────
export const serviceResubmitPost = async (postId: number) => {
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) throw new CustomError("Post tidak ditemukan", 404);
  if (post.status !== "revision") {
    throw new CustomError(
      "Hanya post dengan status revision yang bisa di-resubmit",
      400,
    );
  }

  // Deactivate old approval logs so approval count resets
  await db
    .update(logApprovals)
    .set({ is_active: false })
    .where(
      and(
        eq(logApprovals.post_id, postId),
        eq(logApprovals.is_active, true),
      ),
    );

  // Set back to waiting_approval
  await db
    .update(posts)
    .set({ status: "waiting_approval" })
    .where(eq(posts.id, postId));

  return { resubmitted: true };
};

// ─────────────────────────────────────────────
// 5. GET approval queue  (posts waiting_approval + approved)
// ─────────────────────────────────────────────
export const serviceGetApprovalQueue = async (page?: number, limit?: number) => {
  const [countResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(posts)
    .where(inArray(posts.status, ["waiting_approval", "approved"]));

  const totalCount = Number(countResult?.count ?? 0);

  const data = await db.query.posts.findMany({
    where: inArray(posts.status, ["waiting_approval", "approved"]),
    with: {
      category: true,
      author: {
        columns: { id: true, name: true, email: true },
      },
      log_approvals: {
        where: and(
          eq(logApprovals.is_active, true),
          eq(logApprovals.action, 1),
        ),
        with: {
          approver: { columns: { id: true, name: true } },
        },
      },
    },
    orderBy: (posts, { desc }) => [desc(posts.created_at)],
    ...(page && limit ? { limit, offset: (page - 1) * limit } : {}),
  });

  const [config] = await db.select().from(approvalConfig).limit(1);
  const minAdminApprovals = config?.min_admin_approvals ?? 2;

  const mappedData = data.map((post) => {
    const totalApprovals = post.log_approvals.length;

    return {
      ...post,
      total_approvals: totalApprovals,
      min_admin_approvals: minAdminApprovals,
    };
  });

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

// ─────────────────────────────────────────────
// 6. GET approval history
// ─────────────────────────────────────────────
export const serviceGetApprovalHistory = async (
  page = 1,
  limit = 20,
) => {
  const offset = (page - 1) * limit;

  const data = await db.query.logApprovals.findMany({
    with: {
      post: {
        columns: { id: true, title: true, slug: true, status: true },
      },
      approver: { columns: { id: true, name: true } },
    },
    orderBy: (la, { desc }) => [desc(la.created_at)],
    limit,
    offset,
  });

  const [countResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(logApprovals);

  const totalCount = countResult?.count ?? 0;

  return {
    data,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

// ─────────────────────────────────────────────
// 7. GET approval config
// ─────────────────────────────────────────────
export const serviceGetApprovalConfig = async () => {
  const [config] = await db.select().from(approvalConfig).limit(1);

  if (!config) {
    // Create default config if none exists
    const [inserted] = await db
      .insert(approvalConfig)
      .values({})
      .returning();
    return inserted;
  }

  return config;
};

// ─────────────────────────────────────────────
// 8. UPDATE approval config
// ─────────────────────────────────────────────
export const serviceUpdateApprovalConfig = async (
  minAdminApprovals: number,
) => {
  if (minAdminApprovals < 1) {
    throw new CustomError("min_admin_approvals minimal 1", 400);
  }

  const [existing] = await db.select().from(approvalConfig).limit(1);

  if (existing) {
    const [updated] = await db
      .update(approvalConfig)
      .set({
        min_admin_approvals: minAdminApprovals,
        updated_at: sql`(CURRENT_TIMESTAMP)`,
      })
      .where(eq(approvalConfig.id, existing.id))
      .returning();
    return updated;
  }

  const [inserted] = await db
    .insert(approvalConfig)
    .values({ min_admin_approvals: minAdminApprovals })
    .returning();
  return inserted;
};

// ─────────────────────────────────────────────
// 9. GET master admin list (all admin users)
// ─────────────────────────────────────────────
export const serviceGetMasterAdminList = async () => {
  const data = await db.query.users.findMany({
    where: eq(users.role, "admin"),
    columns: { id: true, name: true, email: true },
    with: {
      masterAdmin: {
        columns: { id: true, is_approver: true },
      },
    },
  });

  return data.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    master_admin_id: u.masterAdmin?.id ?? null,
    is_approver: u.masterAdmin?.is_approver ?? false,
  }));
};

// ─────────────────────────────────────────────
// 10. TOGGLE master admin is_approver
// ─────────────────────────────────────────────
export const serviceToggleMasterAdmin = async (
  userId: number,
  isApprover: boolean,
) => {
  // Verify user exists and is admin
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userId), eq(users.role, "admin")))
    .limit(1);

  if (!user) {
    throw new CustomError("User admin tidak ditemukan", 404);
  }

  const [existing] = await db
    .select()
    .from(masterAdmin)
    .where(eq(masterAdmin.user_id, userId))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(masterAdmin)
      .set({ is_approver: isApprover })
      .where(eq(masterAdmin.id, existing.id))
      .returning();
    return updated;
  }

  const [inserted] = await db
    .insert(masterAdmin)
    .values({ user_id: userId, is_approver: isApprover })
    .returning();
  return inserted;
};

// ─────────────────────────────────────────────
// 11. GET latest revision notes for a post
// ─────────────────────────────────────────────
export const serviceGetRevisionNotes = async (postId: number) => {
  const [log] = await db.query.logApprovals.findMany({
    where: and(
      eq(logApprovals.post_id, postId),
      eq(logApprovals.action, 0),
      eq(logApprovals.is_active, true),
    ),
    with: {
      approver: { columns: { name: true } },
    },
    orderBy: (la, { desc }) => [desc(la.created_at)],
    limit: 1,
  });

  if (!log) return null;

  return {
    notes: log.notes,
    approver_name: log.approver.name,
  };
};
