import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/response.js";

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user
 *     description: Clear auth token cookie (requires authentication)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logout berhasil
 *       401:
 *         description: Unauthorized
 */
export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("auth_token");
  sendSuccess(res, null, "Logout berhasil");
};
