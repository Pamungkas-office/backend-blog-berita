import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceGetActiveAdByPosition } from "../../services/admin/ad/adService.js";
import { sendSuccess } from "../../utils/response.js";

const positionSchema = z.enum(["auto_ads", "header", "sidebar", "in_article", "footer"]);

/**
 * @openapi
 * /api/ad-positions/{position}:
 *   get:
 *     tags: [Ad Positions]
 *     summary: Get active ad by position
 *     description: Retrieve the active advertisement for a specific position
 *     parameters:
 *       - in: path
 *         name: position
 *         required: true
 *         schema:
 *           type: string
 *           enum: [auto_ads, header, sidebar, in_article, footer]
 *         description: Ad position identifier
 *     responses:
 *       200:
 *         description: Ad data or null if no active ad
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
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: integer
 *                     position:
 *                       type: string
 *                     is_active:
 *                       type: boolean
 *       400:
 *         description: Invalid position
 *       500:
 *         description: Internal server error
 */
export const getActiveAd = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const position = positionSchema.parse(req.params.position);
    const ad = await serviceGetActiveAdByPosition(position);
    sendSuccess(res, ad ?? null, ad ? "Iklan ditemukan" : "Tidak ada iklan aktif untuk posisi ini");
  } catch (error) {
    next(error);
  }
};
