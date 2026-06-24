import { eq } from "drizzle-orm";
import { db } from "../../lib/db/db.js";
import { users } from "../../lib/db/schema.js";
import { CustomError } from "../../lib/custom-error.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const serviceLogin = async (email: string, password: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (!user) {
    throw new CustomError("Email tidak terdaftar", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new CustomError("Password tidak ditemukan", 401);
  }

  if (!user.email_verified_at) {
    throw new CustomError(
      "Email belum diverifikasi. Silakan cek email Anda.",
      403,
    );
  }

  const payload = { id: String(user.id), email: user.email, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any,
  });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};