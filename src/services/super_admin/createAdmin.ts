import { eq } from "drizzle-orm";
import { db } from "../../lib/db/db.js";
import { masterAdmin, users } from "../../lib/db/schema.js";
import { CustomError } from "../../lib/custom-error.js";

export const serviceCreateAdmin = async (
  name: string,
  email: string,
  password: string,
  isApprover: boolean,
) => {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    throw new CustomError("Email sudah terdaftar", 409);
  }

  const hashedPassword = await import("bcryptjs").then((bcrypt) =>
    bcrypt.hash(password, 12),
  );

  const [insertedUser] = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    })
    .returning();

  await db.insert(masterAdmin).values({
    user_id: insertedUser!.id,
    is_approver: isApprover,
  });

  return {
    id: insertedUser!.id,
    name: insertedUser!.name,
    email: insertedUser!.email,
    role: insertedUser!.role,
    is_approver: isApprover,
  };
};
