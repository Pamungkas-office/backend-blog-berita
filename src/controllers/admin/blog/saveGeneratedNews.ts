import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceSaveGenerated } from "../../../services/admin/blog/saveGeneratedNews.js";
import { sendSuccess } from "../../../utils/response.js";

export const saveGeneratedNewsSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  news: z.string().min(1, "Konten berita wajib diisi"),
  category: z
    .array(z.string())
    .min(1, "Minimal 1 kategori")
    .max(3, "Maksimal 3 kategori"),
  tags: z
    .array(z.string().min(1, "Tag tidak boleh kosong"))
    .min(1, "Minimal 1 tag")
    .max(5, "Maksimal 5 tag"),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
});

/**
 * @openapi
 * /api/admin/posts/save-generated:
 *   post:
 *     tags: [Admin Blog]
 *     summary: Save AI-generated content
 *     description: Save AI-generated news content as a draft post (requires admin)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - news
 *               - category
 *               - tags
 *             properties:
 *               title:
 *                 type: string
 *                 example: Perkembangan AI di Indonesia 2026
 *               news:
 *                 type: string
 *                 description: HTML content
 *                 example: "<p>Gengs, lo pada tau gak sih kalo perkembangan AI di Indonesia sekarang tuh lagi naik daun banget?</p>"
 *               category:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 maxItems: 3
 *                 example: ["Teknologi"]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 maxItems: 5
 *                 example: ["AI", "Machine Learning", "Indonesia Digital"]
 *               meta_title:
 *                 type: string
 *                 example: AI Indonesia 2026 - Perkembangan Terbaru
 *               meta_description:
 *                 type: string
 *                 example: Simak perkembangan terbaru AI di Indonesia tahun 2026
 *     responses:
 *       201:
 *         description: Content saved as draft
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
 *                   example: Berita berhasil disimpan sebagai draft
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: integer, example: 1 }
 *                     user_id: { type: integer, example: 1 }
 *                     title: { type: string, example: Perkembangan AI di Indonesia 2026 }
 *                     slug: { type: string, example: perkembangan-ai-di-indonesia-2026 }
 *                     content: { type: string, example: "<p>Gengs, lo pada tau gak sih kalo perkembangan AI di Indonesia sekarang tuh lagi naik daun banget?</p>" }
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
 *       500:
 *         description: Internal server error
 */
export const saveGeneratedNews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = saveGeneratedNewsSchema.parse(req.body);

    const isSuperAdmin = req.user!.role === "super_admin";

    const post = await serviceSaveGenerated(Number(req.user!.id), {
      title: data.title,
      news: data.news,
      category: data.category,
      tags: data.tags,
      meta_title: data.meta_title ?? null,
      meta_description: data.meta_description ?? null,
    }, isSuperAdmin);

    sendSuccess(res, post, "Berita berhasil disimpan", 201);
  } catch (error) {
    next(error);
  }
};
