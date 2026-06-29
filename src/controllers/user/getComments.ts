import type { NextFunction, Request, Response } from "express";
import { serviceGetComments } from "../../services/user/comments/getComments.js";
import { sendSuccess } from "../../utils/response.js";

/**
 * @openapi
 * /api/comments/{slug}:
 *   get:
 *     tags: [Comments]
 *     summary: Get comments by post slug
 *     description: Retrieve all comments for a specific post
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Post slug
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       comment:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *       500:
 *         description: Internal server error
 */
export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.params;
    const comments = await serviceGetComments(slug as string);
    sendSuccess(res, comments, "Berhasil mendapatkan data komentar");
  } catch (error) {
    next(error);
  }
};
