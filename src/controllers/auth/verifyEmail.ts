import type { NextFunction, Request, Response } from "express";
import * as z from "zod";
import { sendSuccess } from "../../utils/response.js";
import { serviceVerifyEmail } from "../../services/auth/verifyEmail.js";

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token wajib diisi"),
});

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = verifyEmailSchema.parse(req.query);

    await serviceVerifyEmail(token);

    sendSuccess(res, null, "Email berhasil diverifikasi. Silakan login.");
  } catch (error) {
    next(error);
  }
};
