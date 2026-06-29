import type { NextFunction, Request, Response } from "express";
import { serviceGetAllAds } from "../../../services/admin/ad/adService.js";
import { sendSuccess } from "../../../utils/response.js";

/**
 * @openapi
 * /api/admin/ad-positions:
 *   get:
 *     tags: [Admin Ad Positions]
 *     summary: Get all ads
 *     description: Retrieve all advertisement positions (requires admin)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of ads
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       500:
 *         description: Internal server error
 */
export const getAllAds = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const ads = await serviceGetAllAds();
    sendSuccess(res, ads, "Daftar iklan berhasil diambil");
  } catch (error) {
    next(error);
  }
};
