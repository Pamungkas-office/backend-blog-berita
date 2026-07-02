import { eq, sql } from "drizzle-orm";
import { db } from "../../lib/db/db.js";
import { users } from "../../lib/db/schema.js";

export const serviceGetUsers = async (page?: number, limit?: number) => {
  const [countResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .where(eq(users.role, "admin"));

  const totalCount = Number(countResult?.count ?? 0);

  const data = await db.query.users.findMany({
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      created_at: true,
    },
    with: {
      masterAdmin: {
        columns: { id: true, is_approver: true },
      },
    },
    where: eq(users.role, "admin"),
    orderBy: (users, { desc }) => [desc(users.created_at)],
    ...(page && limit ? { limit, offset: (page - 1) * limit } : {}),
  });

  const mappedData = data.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    created_at: u.created_at,
    master_admin_id: u.masterAdmin?.id ?? null,
    is_approver: u.masterAdmin?.is_approver ?? false,
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
