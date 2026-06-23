import type { Request, Response, NextFunction } from "express";
import * as z from "zod";
import { sendSuccess } from "../../utils/response.js";
import { sendResetPasswordEmail } from "../../services/email/emailService.js";
import { serviceForgotPassword } from "../../services/auth/forgotPassword.js";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const rawToken = await serviceForgotPassword(email);

    if (rawToken) {
      await sendResetPasswordEmail(email, rawToken);
    }

    sendSuccess(
      res,
      null,
      "Jika email terdaftar, link reset password telah dikirim.",
    );
  } catch (error) {
    next(error);
  }
};
