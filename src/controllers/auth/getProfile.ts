import type { NextFunction, Request, Response } from "express";
import { serviceGetProfile } from "../../services/auth/getProfile.js";
import { sendSuccess } from "../../utils/response.js";

/**
 * @openapi
 * /api/auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Get user profile
 *     description: Retrieve the authenticated user's profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await serviceGetProfile(req.user!.id);
    sendSuccess(res, profile, "Profile berhasil diambil");
  } catch (error) {
    next(error);
  }
};
