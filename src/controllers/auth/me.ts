import type { NextFunction, Request, Response } from "express";
import { serviceGetMe } from "../../services/auth/getMe.js";
import { sendSuccess } from "../../utils/response.js";

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user
 *     description: Retrieve the currently authenticated user's data
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     email_verified_at:
 *                       type: string
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await serviceGetMe(req.user!.id);
    sendSuccess(res, user, "Data user berhasil diambil");
  } catch (error) {
    next(error);
  }
};
