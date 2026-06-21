import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceUpdateAd } from "../../../services/admin/ad/adService.js";
import { sendSuccess } from "../../../utils/response.js";

const updateAdSchema = z.object({
  ad_code: z.string().min(1, "Kode iklan wajib diisi"),
  is_active: z.boolean(),
});

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
