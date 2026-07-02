import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceUpdatePost } from "../../../services/admin/blog/updateNews.js";
import { sendSuccess } from "../../../utils/response.js";
import { generateSlug } from "../../../utils/slug.js";
import { MediaService } from "../../../lib/upload.js";

const updatePostSchema = z.object({
  title: z.string().min(5, "Minimal 5 karakter untuk judul").optional(),
  slug: z.string().optional(),
  content: z.string().min(15, "Minimal 15 karakter untuk isi").optional(),
  category_id: z.coerce.number({
    error: "Category ID harus berupa angka",
  }).positive("Category ID tidak valid").optional(),
  status: z.enum(["draft", "waiting_approval"]).optional(),
  thumbnail: z.string().nullable().optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
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
});

/**
 * @openapi
 * /api/admin/posts/{id}:
 *   put:
 *     tags: [Admin Blog]
 *     summary: Update a news post
 *     description: Update an existing blog post with optional thumbnail upload (requires admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 example: Perkembangan AI di Indonesia 2026
 *               slug:
 *                 type: string
 *                 example: perkembangan-ai-di-indonesia-2026
 *               content:
 *                 type: string
 *                 minLength: 15
 *                 example: "<p>Perkembangan kecerdasan buatan di Indonesia semakin pesat...</p>"
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 example: published
 *               tag_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               meta_title:
 *                 type: string
 *                 example: AI Indonesia 2026 - Perkembangan Terbaru
 *               meta_description:
 *                 type: string
 *                 example: Simak perkembangan terbaru AI di Indonesia tahun 2026
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *               remove_thumbnail:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: News post updated
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
 *                   example: Berita berhasil diperbarui
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: integer, example: 1 }
 *                     user_id: { type: integer, example: 1 }
 *                     title: { type: string, example: Perkembangan AI di Indonesia 2026 }
 *                     slug: { type: string, example: perkembangan-ai-di-indonesia-2026 }
 *                     content: { type: string, example: "<p>Perkembangan kecerdasan buatan di Indonesia semakin pesat...</p>" }
 *                     category_id: { type: integer, example: 1 }
 *                     status: { type: string, enum: [draft, published], example: published }
 *                     thumbnail: { type: string, nullable: true, example: "https://example.com/uploads/thumbnail.jpg" }
 *                     meta_title: { type: string, nullable: true, example: AI Indonesia 2026 - Perkembangan Terbaru }
 *                     meta_description: { type: string, nullable: true, example: Simak perkembangan terbaru AI di Indonesia tahun 2026 }
 *                     created_at: { type: string, example: "2026-06-29T10:00:00.000Z" }
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Post not found
 *       409:
 *         description: Slug already used
 *       500:
 *         description: Internal server error
 */
export const updateNews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = updatePostSchema.parse(req.body);

    let slug = data.slug;
    if (data.title && !data.slug) {
      slug = generateSlug(data.title);
    }

    let thumbnail = data.thumbnail;
    if (req.file) {
      thumbnail = await MediaService.uploadThumbnail(req.file);
    }

    const isSuperAdmin = req.user!.role === "super_admin";

    const post = await serviceUpdatePost(id, {
      title: data.title,
      slug,
      content: data.content,
      category_id: data.category_id,
      status: data.status,
      thumbnail,
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      tag_ids: data.tag_ids,
    }, {
      isSuperAdmin,
      userId: Number(req.user!.id),
    });

    sendSuccess(res, post, "Berita berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};
