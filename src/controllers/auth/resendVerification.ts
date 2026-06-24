import type { Request, Response, NextFunction } from "express";
import * as z from "zod";
import { sendSuccess } from "../../utils/response.js";
import { serviceResendVerification } from "../../services/auth/resendVerification.js";

const resendSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

export const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = resendSchema.parse(req.body);

    await serviceResendVerification(email);

    sendSuccess(
      res,
      null,
      "Jika email terdaftar dan belum diverifikasi, link verifikasi telah dikirim.",
    );
  } catch (error) {
    next(error);
  }
};
