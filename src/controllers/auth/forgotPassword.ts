import type { Request, Response, NextFunction } from "express";
import * as z from "zod";
import { sendSuccess } from "../../utils/response.js";
import { serviceForgotPassword } from "../../services/auth/forgotPassword.js";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

/**
 * @openapi
 * /api/password/forgot-password:
 *   post:
 *     tags: [Password]
 *     summary: Forgot password
 *     description: Send password reset link to email. Rate limited to 3 requests per 30 minutes.
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
 *         description: Reset link sent if email is registered
 *       400:
 *         description: Invalid email
 *       429:
 *         description: Too many requests - rate limited
 *       500:
 *         description: Internal server error
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    await serviceForgotPassword(email);

    sendSuccess(
      res,
      null,
      "Jika email terdaftar, link reset password telah dikirim.",
    );
  } catch (error) {
    next(error);
  }
};
