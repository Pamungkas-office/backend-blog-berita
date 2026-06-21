import type { NextFunction, Request, Response } from "express";
import { serviceGetAllAds } from "../../../services/admin/ad/adService.js";
import { sendSuccess } from "../../../utils/response.js";

export const getAllAds = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const ads = await serviceGetAllAds();
    sendSuccess(res, ads, "Daftar iklan berhasil diambil");
  } catch (error) {
    next(error);
  }
};
