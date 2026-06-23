import type { Request, Response, NextFunction } from "express";
import * as z from "zod";
import { sendSuccess } from "../../utils/response.js";
import { serviceResetPassword } from "../../services/auth/resetPassword.js";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token wajib diisi"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);

    await serviceResetPassword(token, password);

    sendSuccess(res, null, "Password berhasil direset.");
  } catch (error) {
    next(error);
  }
};
