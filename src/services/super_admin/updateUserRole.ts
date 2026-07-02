import { eq } from "drizzle-orm";
import { db } from "../../lib/db/db.js";
import { masterAdmin, users } from "../../lib/db/schema.js";
import { CustomError } from "../../lib/custom-error.js";

export const serviceUpdateUserRole = async (
  userId: number,
  newRole: "admin" | "user",
) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new CustomError("User tidak ditemukan", 404);
  if (user.role === "super_admin") {
    throw new CustomError("Tidak dapat mengubah role Super Admin", 400);
  }
  if (user.role === newRole) {
    throw new CustomError(`User sudah berperan sebagai ${newRole}`, 400);
  }

  const [updated] = await db
    .update(users)
    .set({ role: newRole })
    .where(eq(users.id, userId))
    .returning();

  if (newRole === "user") {
    await db
      .delete(masterAdmin)
      .where(eq(masterAdmin.user_id, userId));
  }

  if (newRole === "admin") {
    const [existingMaster] = await db
      .select()
      .from(masterAdmin)
      .where(eq(masterAdmin.user_id, userId))
      .limit(1);

    if (!existingMaster) {
      await db.insert(masterAdmin).values({
        user_id: userId,
        is_approver: false,
      });
    }
  }

  return {
    id: updated!.id,
    name: updated!.name,
    email: updated!.email,
    role: updated!.role,
  };
};
