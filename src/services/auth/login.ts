import crypto from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "../../lib/db/db.js";
import { masterAdmin, users } from "../../lib/db/schema.js";
import { CustomError } from "../../lib/custom-error.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../email/emailService.js";

export const serviceLogin = async (email: string, password: string) => {
  const [result] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      password: users.password,
      role: users.role,
      email_verified_at: users.email_verified_at,
      email_verification_token: users.email_verification_token,
      is_approver: sql<boolean>`COALESCE(${masterAdmin.is_approver}, 0)`,
    })
    .from(users)
    .leftJoin(masterAdmin, eq(masterAdmin.user_id, users.id))
    .where(eq(users.email, email))
    .limit(1);

  if (!result) {
    throw new CustomError("Email tidak terdaftar", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, result.password);
  if (!isPasswordValid) {
    throw new CustomError("Password tidak ditemukan", 401);
  }

  if (!result.email_verified_at) {
    if (!result.email_verification_token) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
      const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      ).toISOString();

      // Simpan token ke DB dulu sebelum kirim email
      await db
        .update(users)
        .set({
          email_verification_token: hashedToken,
          email_verification_expires_at: expiresAt,
        })
        .where(eq(users.id, result.id));
      try {
        await sendVerificationEmail(email, rawToken);
      } catch {
        throw new CustomError(
          "Gagal mengirim email verifikasi. Silakan coba lagi.",
          500,
        );
      }
    } else {
      console.log("[LOGIN] Token already exists for:", email, "user:", result.id);
    }

    throw new CustomError(
      "Email belum diverifikasi. Silakan cek email Anda.",
      403,
    );
  }

  const payload = { id: String(result.id), email: result.email, role: result.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any,
  });

  return {
    token,
    user: {
      id: result.id,
      name: result.name,
      email: result.email,
      role: result.role,
      is_approver: result.is_approver,
    },
  };
};
