import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceGetActiveAdByPosition } from "../../services/admin/ad/adService.js";
import { sendSuccess } from "../../utils/response.js";

const positionSchema = z.enum(["auto_ads", "header", "sidebar", "in_article", "footer"]);

export const getActiveAd = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const position = positionSchema.parse(req.params.position);
    const ad = await serviceGetActiveAdByPosition(position);
    sendSuccess(res, ad ?? null, ad ? "Iklan ditemukan" : "Tidak ada iklan aktif untuk posisi ini");
  } catch (error) {
    next(error);
  }
};
