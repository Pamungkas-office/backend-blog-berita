import type { NextFunction, Request, Response } from "express";
import { serviceDeleteAd } from "../../../services/admin/ad/adService.js";
import { sendSuccess } from "../../../utils/response.js";

/**
 * @openapi
 * /api/admin/ad-positions/{id}:
 *   delete:
 *     tags: [Admin Ad Positions]
 *     summary: Delete an ad
 *     description: Delete an advertisement by ID (requires admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ad ID
 *     responses:
 *       200:
 *         description: Ad deleted
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Ad not found
 *       500:
 *         description: Internal server error
 */
export const deleteAd = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID tidak valid" });
    }
    await serviceDeleteAd(id);
    sendSuccess(res, null, "Iklan berhasil dihapus");
  } catch (error) {
    next(error);
  }
};
