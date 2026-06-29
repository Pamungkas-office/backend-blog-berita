import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceUpdateAd } from "../../../services/admin/ad/adService.js";
import { sendSuccess } from "../../../utils/response.js";

const updateAdSchema = z.object({
  ad_code: z.string().min(1, "Kode iklan wajib diisi"),
  is_active: z.boolean(),
});

/**
 * @openapi
 * /api/admin/ad-positions/{id}:
 *   put:
 *     tags: [Admin Ad Positions]
 *     summary: Update an ad
 *     description: Update an existing advertisement by ID (requires admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ad ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ad_code
 *               - is_active
 *             properties:
 *               ad_code:
 *                 type: string
 *                 description: HTML/JavaScript ad code
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Ad updated
 *       400:
 *         description: Validation error or invalid ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Ad not found
 *       500:
 *         description: Internal server error
 */
export const updateAd = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID tidak valid" });
    }
    const data = updateAdSchema.parse(req.body);
    const ad = await serviceUpdateAd(id, data);
    sendSuccess(res, ad, "Iklan berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};
