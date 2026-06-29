import type { NextFunction, Request, Response } from "express";
import { getPostIdBySlug, recordPageView } from "../../services/user/blog/pageView.service.js";
import { sendSuccess } from "../../utils/response.js";
import { CustomError } from "../../lib/custom-error.js";

/**
 * @openapi
 * /api/posts/{slug}/view:
 *   post:
 *     tags: [Blog Public]
 *     summary: Record page view
 *     description: Record a page view for a post. Requires X-Visitor-Id header for unique visitor tracking.
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Post slug
 *       - in: header
 *         name: X-Visitor-Id
 *         schema:
 *           type: string
 *         description: Unique visitor identifier
 *     responses:
 *       200:
 *         description: View recorded
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
 *                   example: View recorded
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
export const recordPageViewController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug as string;
    const postId = await getPostIdBySlug(slug);

    if (!postId) {
      throw new CustomError("Post tidak ditemukan", 404);
    }

    const visitorId = (req.headers["x-visitor-id"] as string) || "";
    const userId = req.user?.id ? Number(req.user.id) : null;

    await recordPageView({ postId, userId, visitorId });

    sendSuccess(res, null, "View recorded");
  } catch (error) {
    next(error);
  }
};
