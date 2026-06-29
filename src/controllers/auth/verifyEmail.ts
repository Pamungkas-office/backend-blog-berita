import type { NextFunction, Request, Response } from "express";
import * as z from "zod";
import { sendSuccess } from "../../utils/response.js";
import { serviceVerifyEmail } from "../../services/auth/verifyEmail.js";

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token wajib diisi"),
});

/**
 * @openapi
 * /api/auth/verify-email:
 *   get:
 *     tags: [Auth]
 *     summary: Verify email
 *     description: Verify user email using verification token from email link
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid, expired, or already verified token
 *       500:
 *         description: Internal server error
 */
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
