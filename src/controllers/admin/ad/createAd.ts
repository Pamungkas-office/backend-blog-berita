import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceCreateAd } from "../../../services/admin/ad/adService.js";
import { sendSuccess } from "../../../utils/response.js";

const adSchema = z.object({
  position: z.enum(["auto_ads", "header", "sidebar", "in_article", "footer"]),
  ad_code: z.string().min(1, "Kode iklan wajib diisi"),
  is_active: z.boolean().default(true),
});

export const createAd = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = adSchema.parse(req.body);
    const ad = await serviceCreateAd(data.position, data.ad_code, data.is_active);
    sendSuccess(res, ad, "Iklan berhasil dibuat", 201);
  } catch (error) {
    next(error);
  }
};
