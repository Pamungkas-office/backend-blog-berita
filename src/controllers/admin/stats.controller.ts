import type { NextFunction, Request, Response } from "express";
import { getTotalViews } from "../../services/user/blog/pageView.service.js";
import { sendSuccess } from "../../utils/response.js";

/**
 * @openapi
 * /api/admin/stats/total-views:
 *   get:
 *     tags: [Admin Stats]
 *     summary: Get total views
 *     description: Retrieve total page views across all posts (requires admin)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Total views count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_views:
 *                       type: integer
 *                       example: 1500
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       500:
 *         description: Internal server error
 */
export const getTotalViewsStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const total = await getTotalViews();
    sendSuccess(res, { total_views: total }, "Total views fetched");
  } catch (error) {
    next(error);
  }
};
