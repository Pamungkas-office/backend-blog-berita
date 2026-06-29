import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceGenerateContent } from "../../../services/admin/blog/generateNews.js";
import { sendSuccess } from "../../../utils/response.js";

export const generateNewsSchema = z.object({
  url: z.string({ message: "URL berita wajib diisi" }),
});

/**
 * @openapi
 * /api/admin/posts/generate:
 *   post:
 *     tags: [Admin Blog]
 *     summary: Generate content with AI
 *     description: Generate news content from a URL using AI (requires admin)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: https://www.kompas.com/teknologi/artikel-ai-indonesia-2026
 *     responses:
 *       200:
 *         description: Content generated successfully
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
 *                   example: Berita berhasil digenerate
 *                 data:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "Perkembangan AI di Indonesia 2026"
 *                     news:
 *                       type: string
 *                       example: "<p>Gengs, lo pada tau gak sih kalo perkembangan AI di Indonesia sekarang tuh lagi naik daun banget? Yuk kita bahas bareng-bareng!</p>"
 *                     category:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Teknologi"]
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["AI", "Machine Learning", "Indonesia Digital"]
 *                     meta_title:
 *                       type: string
 *                       nullable: true
 *                       example: "AI Indonesia 2026 - Perkembangan Terbaru"
 *                     meta_description:
 *                       type: string
 *                       nullable: true
 *                       example: "Simak perkembangan terbaru AI di Indonesia tahun 2026"
 *                     provider:
 *                       type: string
 *                       nullable: true
 *                       example: gemini
 *       400:
 *         description: Invalid URL or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       502:
 *         description: AI service failed
 *       500:
 *         description: Internal server error
 */
export const generateNews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { url } = generateNewsSchema.parse(req.body);
    const content = await serviceGenerateContent(url);

    sendSuccess(res, content, "Berita berhasil digenerate", 200);
  } catch (error) {
    next(error);
  }
};
