import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceChangePassword } from "../../services/auth/changePassword.js";
import { sendPasswordChangedEmail } from "../../services/email/emailService.js";
import { sendSuccess } from "../../utils/response.js";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
});

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(
      req.body,
    );

    const { email, name } = await serviceChangePassword(
      req.user!.id,
      currentPassword,
      newPassword,
    );

    await sendPasswordChangedEmail(email, name);

    sendSuccess(res, null, "Password berhasil diubah");
  } catch (error) {
    next(error);
  }
};
