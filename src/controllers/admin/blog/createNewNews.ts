import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceCreatePost } from "../../../services/admin/blog/createNews.js";
import { sendSuccess } from "../../../utils/response.js";
import { generateSlug } from "../../../utils/slug.js";

export const createNewsSchema = z.object({
  title: z.string(),
  content: z.string(),
  status: z
    .enum(["draft", "waiting_approval"])
    .optional()
    .default("waiting_approval"),

  category_id: z.coerce.number({
    error: "Category ID harus berupa angka",
  }).positive("Category ID tidak valid"),

  tag_ids: z
    .preprocess((val) => {
      if (typeof val === "string") {
        if (val === "") return undefined;
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    }, z.array(z.number()))
    .optional(),

  thumbnail: z.string().optional().nullable(),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
});

/**
 * @openapi
 * /api/admin/posts:
 *   post:
 *     tags: [Admin Blog]
 *     summary: Create a news post
 *     description: Create a new blog post with optional thumbnail upload (requires admin)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - category_id
 *               - status
 *             properties:
 *               title:
 *                 type: string
 *                 example: Berita Terbaru
 *               content:
 *                 type: string
 *                 description: HTML content
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *               tag_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of tag IDs (can be JSON string)
 *               meta_title:
 *                 type: string
 *               meta_description:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Thumbnail image file
 *     responses:
 *       201:
 *         description: News post created
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
 *                   example: Berita berhasil dibuat
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: integer, example: 1 }
 *                     user_id: { type: integer, example: 1 }
 *                     title: { type: string, example: Perkembangan AI di Indonesia 2026 }
 *                     slug: { type: string, example: perkembangan-ai-di-indonesia-2026 }
 *                     content: { type: string, example: "<p>Perkembangan kecerdasan buatan di Indonesia semakin pesat...</p>" }
 *                     category_id: { type: integer, example: 1 }
 *                     status: { type: string, enum: [draft, published], example: draft }
 *                     thumbnail: { type: string, nullable: true, example: null }
 *                     meta_title: { type: string, nullable: true, example: AI Indonesia 2026 - Perkembangan Terbaru }
 *                     meta_description: { type: string, nullable: true, example: Simak perkembangan terbaru AI di Indonesia tahun 2026 }
 *                     created_at: { type: string, example: "2026-06-29T10:00:00.000Z" }
 *                     category:
 *                       type: object
 *                       properties:
 *                         id: { type: integer, example: 1 }
 *                         name: { type: string, example: Teknologi }
 *                         slug: { type: string, example: teknologi }
 *                     post_tags:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id: { type: integer, example: 1 }
 *                           post_id: { type: integer, example: 1 }
 *                           tag_id: { type: integer, example: 1 }
 *                           tag:
 *                             type: object
 *                             properties:
 *                               id: { type: integer, example: 1 }
 *                               name: { type: string, example: AI }
 *                               slug: { type: string, example: ai }
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Category not found
 *       409:
 *         description: Slug already used
 *       500:
 *         description: Internal server error
 */
export const createNewNews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = createNewsSchema.parse(req.body);
    const slug = generateSlug(data.title);

    // Super admin can create with any allowed status; regular admin defaults to waiting_approval
    const isSuperAdmin = req.user!.role === "super_admin";
    const finalStatus = isSuperAdmin ? data.status : "waiting_approval";

    const post = await serviceCreatePost(
      Number(req.user!.id),
      {
        title: data.title,
        slug,
        content: data.content,
        category_id: data.category_id,
        status: finalStatus,
        meta_title: data.meta_title ?? null,
        meta_description: data.meta_description ?? null,
        tag_ids: data.tag_ids,
      },
      req.file,
    );

    sendSuccess(res, post, "Berita berhasil dibuat", 201);
  } catch (error) {
    next(error);
  }
};
