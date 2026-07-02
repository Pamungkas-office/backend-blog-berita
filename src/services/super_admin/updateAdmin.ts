import { eq } from "drizzle-orm";
import { db } from "../../lib/db/db.js";
import { masterAdmin, users } from "../../lib/db/schema.js";
import { CustomError } from "../../lib/custom-error.js";

export const serviceUpdateAdmin = async (
  userId: number,
  data: {
    name?: string;
    email?: string;
    password?: string;
    is_approver?: boolean;
  },
) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new CustomError("User tidak ditemukan", 404);
  if (user.role !== "admin") {
    throw new CustomError("Hanya akun admin yang dapat diedit", 400);
  }

  const updateFields: Record<string, any> = {};

  if (data.name !== undefined) {
    updateFields.name = data.name;
  }

  if (data.email !== undefined && data.email !== user.email) {
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);
    if (existing) {
      throw new CustomError("Email sudah terdaftar", 409);
    }
    updateFields.email = data.email;
  }

  if (data.password) {
    updateFields.password = await import("bcryptjs").then((bcrypt) =>
      bcrypt.hash(data.password!, 12),
    );
  }

  if (Object.keys(updateFields).length > 0) {
    await db.update(users).set(updateFields).where(eq(users.id, userId));
  }

  if (data.is_approver !== undefined) {
    await db
      .update(masterAdmin)
      .set({ is_approver: data.is_approver })
      .where(eq(masterAdmin.user_id, userId));
  }

  const [updated] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      is_approver: masterAdmin.is_approver,
    })
    .from(users)
    .leftJoin(masterAdmin, eq(masterAdmin.user_id, users.id))
    .where(eq(users.id, userId))
    .limit(1);

  return updated;
};
