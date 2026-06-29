import type { NextFunction, Request, Response } from "express";
import { serviceGetPublishedPosts } from "../../services/user/blog/getPublishedPosts.js";
import { sendSuccess } from "../../utils/response.js";

/**
 * @openapi
 * /api/posts:
 *   get:
 *     tags: [Blog Public]
 *     summary: Get all published posts
 *     description: Retrieve a list of all published blog posts with category, author, and tags
 *     responses:
 *       200:
 *         description: List of published posts
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       content:
 *                         type: string
 *                       thumbnail:
 *                         type: string
 *                         nullable: true
 *                       status:
 *                         type: string
 *                         enum: [draft, published]
 *                       category:
 *                         type: object
 *                       author:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                       post_tags:
 *                         type: array
 *                         items:
 *                           type: object
 *       500:
 *         description: Internal server error
 */
export const getAllPublishedPost = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await serviceGetPublishedPosts();
    sendSuccess(res, posts, "Daftar post berhasil diambil");
  } catch (error) {
    next(error);
  }
};
