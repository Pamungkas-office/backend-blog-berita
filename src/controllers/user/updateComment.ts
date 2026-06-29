import type { NextFunction, Request, Response } from "express";
import { serviceUpdateComment } from "../../services/user/comments/updateComment.js";
import { sendSuccess } from "../../utils/response.js";

/**
 * @openapi
 * /api/comments/{id}:
 *   patch:
 *     tags: [Comments]
 *     summary: Update a comment
 *     description: Update your own comment (requires authentication)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *             properties:
 *               comment:
 *                 type: string
 *                 description: Updated comment text
 *     responses:
 *       200:
 *         description: Comment updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not your comment
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
export const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const commentId = Number(req.params?.id);
    const userId = Number(req.user?.id);
    const commentText = req.body?.comment;

    const updatedComment = await serviceUpdateComment(commentId, userId, commentText);

    sendSuccess(res, updatedComment, "Komentar berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};