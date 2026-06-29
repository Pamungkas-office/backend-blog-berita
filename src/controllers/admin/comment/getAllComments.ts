import type { NextFunction, Request, Response } from "express";
import { serviceGetAllComments } from "../../../services/admin/comment/getAllComments.js";
import { sendSuccess } from "../../../utils/response.js";

/**
 * @openapi
 * /api/admin/comments:
 *   get:
 *     tags: [Admin Comments]
 *     summary: Get all comments (paginated)
 *     description: Retrieve all comments with pagination (requires admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Paginated comments list
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
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       500:
 *         description: Internal server error
 */
export const getAllComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const result = await serviceGetAllComments(page, limit);
    sendSuccess(res, result, "Daftar komentar berhasil diambil");
  } catch (error) {
    next(error);
  }
};
