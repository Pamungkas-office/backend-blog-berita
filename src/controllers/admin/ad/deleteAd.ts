import type { NextFunction, Request, Response } from "express";
import { serviceDeleteAd } from "../../../services/admin/ad/adService.js";
import { sendSuccess } from "../../../utils/response.js";

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
