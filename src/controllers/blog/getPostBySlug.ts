import type { NextFunction, Request, Response } from "express";
import { serviceGetPostBySlug } from "../../services/user/blog/getPostBySlug.js";
import { sendSuccess } from "../../utils/response.js";

/**
 * @openapi
 * /api/posts/{slug}:
 *   get:
 *     tags: [Blog Public]
 *     summary: Get post by slug
 *     description: Retrieve a single published post by its slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Post slug
 *     responses:
 *       200:
 *         description: Post details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
export const getPostBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug as string;
    const post = await serviceGetPostBySlug(slug);
    sendSuccess(res, post, "Detail post berhasil diambil");
  } catch (error) {
    next(error);
  }
};
