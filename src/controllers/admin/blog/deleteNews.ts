import type { NextFunction, Request, Response } from "express";
import { serviceDeletePost } from "../../../services/admin/blog/deleteNews.js";
import { sendSuccess } from "../../../utils/response.js";

/**
 * @openapi
 * /api/admin/posts/{id}:
 *   delete:
 *     tags: [Admin Blog]
 *     summary: Delete a news post
 *     description: Delete a blog post by ID (requires admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted
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
 *                   example: Berita berhasil dihapus
 *                 data:
 *                   type: null
 *                   example: null
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
export const deleteNews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await serviceDeletePost(id);
    sendSuccess(res, null, "Berita berhasil dihapus");
  } catch (error) {
    next(error);
  }
};
