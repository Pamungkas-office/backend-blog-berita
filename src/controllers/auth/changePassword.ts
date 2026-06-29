import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceChangePassword } from "../../services/auth/changePassword.js";
import { sendPasswordChangedEmail } from "../../services/email/emailService.js";
import { sendSuccess } from "../../utils/response.js";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
});

/**
 * @openapi
 * /api/auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change password
 *     description: Change the authenticated user's password
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: oldpassword123
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: newpassword456
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error or incorrect current password
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
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
