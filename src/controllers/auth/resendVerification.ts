import type { Request, Response, NextFunction } from "express";
import * as z from "zod";
import { sendSuccess } from "../../utils/response.js";
import { serviceResendVerification } from "../../services/auth/resendVerification.js";

const resendSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

/**
 * @openapi
 * /api/auth/resend-verification:
 *   post:
 *     tags: [Auth]
 *     summary: Resend verification email
 *     description: Resend email verification link to the specified email address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Verification email resent if email is registered
 *       400:
 *         description: Invalid email or email already verified
 *       429:
 *         description: Previous verification link still valid
 *       500:
 *         description: Internal server error
 */
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
