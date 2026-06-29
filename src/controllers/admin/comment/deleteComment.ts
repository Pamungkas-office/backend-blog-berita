import type { NextFunction, Request, Response } from "express";
import { serviceDeleteComment } from "../../../services/admin/comment/deleteComment.js";
import { sendSuccess } from "../../../utils/response.js";

/**
 * @openapi
 * /api/admin/comments/{id}:
 *   delete:
 *     tags: [Admin Comments]
 *     summary: Delete a comment (admin)
 *     description: Delete any comment by ID (requires admin)
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
 *         description: Forbidden - admin only
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await serviceDeleteComment(id);
    sendSuccess(res, null, "Komentar berhasil dihapus");
  } catch (error) {
    next(error);
  }
};
