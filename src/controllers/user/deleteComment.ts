import type { NextFunction, Request, Response } from "express";
import { serviceDeleteComment } from "../../services/user/comments/deleteComment.js";
import { sendSuccess } from "../../utils/response.js";

/**
 * @openapi
 * /api/comments/{id}:
 *   delete:
 *     tags: [Comments]
 *     summary: Delete a comment
 *     description: Delete your own comment (requires authentication)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not your comment
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const commentId = Number(req.params?.id);
    const userId = Number(req.user?.id);

    await serviceDeleteComment(commentId, userId);

    sendSuccess(res, "Komentar berhasil dihapus");
  } catch (error) {
    next(error);
  }
};
