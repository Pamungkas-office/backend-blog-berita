import type { Request, Response, NextFunction } from "express";
import * as z from "zod";
import { sendSuccess } from "../../utils/response.js";
import { serviceResetPassword } from "../../services/auth/resetPassword.js";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token wajib diisi"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

/**
 * @openapi
 * /api/password/reset-password:
 *   post:
 *     tags: [Password]
 *     summary: Reset password
 *     description: Reset password using token received via email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: Reset password token from email
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: newpassword456
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid, expired, or already used token
 *       500:
 *         description: Internal server error
 */
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
