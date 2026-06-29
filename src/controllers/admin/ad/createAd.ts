import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceCreateAd } from "../../../services/admin/ad/adService.js";
import { sendSuccess } from "../../../utils/response.js";

const adSchema = z.object({
  position: z.enum(["auto_ads", "header", "sidebar", "in_article", "footer"]),
  ad_code: z.string().min(1, "Kode iklan wajib diisi"),
  is_active: z.boolean().default(true),
});

/**
 * @openapi
 * /api/admin/ad-positions:
 *   post:
 *     tags: [Admin Ad Positions]
 *     summary: Create an ad
 *     description: Create a new advertisement position (requires admin)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - position
 *               - ad_code
 *             properties:
 *               position:
 *                 type: string
 *                 enum: [auto_ads, header, sidebar, in_article, footer]
 *                 example: header
 *               ad_code:
 *                 type: string
 *                 description: HTML/JavaScript ad code
 *               is_active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Ad created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       409:
 *         description: Position already has an ad
 *       500:
 *         description: Internal server error
 */
export const createAd = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = adSchema.parse(req.body);
    const ad = await serviceCreateAd(data.position, data.ad_code, data.is_active);
    sendSuccess(res, ad, "Iklan berhasil dibuat", 201);
  } catch (error) {
    next(error);
  }
};
