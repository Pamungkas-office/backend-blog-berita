import type { NextFunction, Request, Response } from "express";
import { serviceCreateComment } from "../../services/user/comments/createComment.js";
import { sendSuccess } from "../../utils/response.js";
import { CustomError } from "../../lib/custom-error.js";

/**
 * @openapi
 * /api/comments/{slug}:
 *   post:
 *     tags: [Comments]
 *     summary: Create a comment
 *     description: Add a comment to a post (requires authentication)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Post slug
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
 *                 description: Comment text
 *     responses:
 *       201:
 *         description: Comment created
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
 *                   example: Komentar berhasil ditambahkan
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid input or empty comment
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Ambil user id yang login
    const userId = req.user ? req.user.id : undefined;

    // Ambil postingan tertentu berdasarkan slug
    const slug = req.params?.slug as string;

    // Ambil isi dari comment
    const comment = req.body?.comment;

    // Panggil service serviceCreateComment
    const createdComment = await serviceCreateComment(
      Number(userId),
      slug,
      comment,
    );

    // Response
    sendSuccess(res, createdComment, "Komentar berhasil ditambahkan", 201);
  } catch (error) {
    next(error);
  }
};
