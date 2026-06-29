import type { NextFunction, Request, Response } from "express";
import { getAllNewsAdmin } from "../../../services/admin/blog/getAllNews.js";
import { sendSuccess } from "../../../utils/response.js";

/**
 * @openapi
 * /api/admin/posts:
 *   get:
 *     tags: [Admin Blog]
 *     summary: Get all news (admin)
 *     description: Retrieve all news posts with view counts (requires admin)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all news
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
 *                   example: Daftar berita berhasil diambil
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer, example: 1 }
 *                       user_id: { type: integer, example: 1 }
 *                       title: { type: string, example: Perkembangan AI di Indonesia 2026 }
 *                       slug: { type: string, example: perkembangan-ai-di-indonesia-2026 }
 *                       content: { type: string, example: "<p>Perkembangan kecerdasan buatan di Indonesia semakin pesat...</p>" }
 *                       category_id: { type: integer, example: 1 }
 *                       status: { type: string, enum: [draft, published], example: draft }
 *                       thumbnail: { type: string, nullable: true, example: null }
 *                       meta_title: { type: string, nullable: true, example: AI Indonesia 2026 - Perkembangan Terbaru }
 *                       meta_description: { type: string, nullable: true, example: Simak perkembangan terbaru AI di Indonesia tahun 2026 }
 *                       created_at: { type: string, example: "2026-06-29T10:00:00.000Z" }
 *                       category:
 *                         type: object
 *                         properties:
 *                           id: { type: integer, example: 1 }
 *                           name: { type: string, example: Teknologi }
 *                           slug: { type: string, example: teknologi }
 *                       post_tags:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id: { type: integer, example: 1 }
 *                             post_id: { type: integer, example: 1 }
 *                             tag_id: { type: integer, example: 1 }
 *                             tag:
 *                               type: object
 *                               properties:
 *                                 id: { type: integer, example: 1 }
 *                                 name: { type: string, example: AI }
 *                                 slug: { type: string, example: ai }
 *                   example:
 *                     - id: 1
 *                       user_id: 1
 *                       title: "Perkembangan AI di Indonesia 2026"
 *                       slug: "perkembangan-ai-di-indonesia-2026"
 *                       content: "<p>Perkembangan kecerdasan buatan di Indonesia semakin pesat...</p>"
 *                       category_id: 1
 *                       status: "draft"
 *                       thumbnail: null
 *                       meta_title: "AI Indonesia 2026 - Perkembangan Terbaru"
 *                       meta_description: "Simak perkembangan terbaru AI di Indonesia tahun 2026"
 *                       created_at: "2026-06-29T10:00:00.000Z"
 *                       category: { id: 1, name: "Teknologi", slug: "teknologi" }
 *                       post_tags:
 *                         - id: 1
 *                           post_id: 1
 *                           tag_id: 1
 *                           tag: { id: 1, name: "AI", slug: "ai" }
 *                         - id: 2
 *                           post_id: 1
 *                           tag_id: 2
 *                           tag: { id: 2, name: "Machine Learning", slug: "machine-learning" }
 *                     - id: 2
 *                       user_id: 1
 *                       title: "Timnas Indonesia Lolos ke Piala Dunia 2026"
 *                       slug: "timnas-indonesia-lolos-ke-piala-dunia-2026"
 *                       content: "<p>Timnas Indonesia berhasil mencatatkan sejarah...</p>"
 *                       category_id: 2
 *                       status: "published"
 *                       thumbnail: "https://example.com/uploads/thumbnail.jpg"
 *                       meta_title: null
 *                       meta_description: null
 *                       created_at: "2026-06-28T08:30:00.000Z"
 *                       category: { id: 2, name: "Olahraga", slug: "olahraga" }
 *                       post_tags:
 *                         - id: 3
 *                           post_id: 2
 *                           tag_id: 3
 *                           tag: { id: 3, name: "Sepak Bola", slug: "sepak-bola" }
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       500:
 *         description: Internal server error
 */
export const getAllNews = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const news = await getAllNewsAdmin();
    sendSuccess(res, news, "Daftar berita berhasil diambil");
  } catch (error) {
    next(error);
  }
};
