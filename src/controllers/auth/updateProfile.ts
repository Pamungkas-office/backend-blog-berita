import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceUpdateProfile } from "../../services/auth/updateProfile.js";
import { sendSuccess } from "../../utils/response.js";

const updateProfileSchema = z.object({
  name: z.string().min(3, "Minimal nama terdiri dari 3 karakter").optional(),
  email: z.email().min(3, "Minimal email terdiri dari 3 karakter").optional(),
});

/**
 * @openapi
 * /api/auth/profile:
 *   put:
 *     tags: [Auth]
 *     summary: Update user profile
 *     description: Update the authenticated user's name and/or email
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johnnew@example.com
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Email already used by another user
 *       500:
 *         description: Internal server error
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email } = updateProfileSchema.parse(req.body);
    const profile = await serviceUpdateProfile(req.user!.id, name, email);
    sendSuccess(res, profile, "Profile berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};
