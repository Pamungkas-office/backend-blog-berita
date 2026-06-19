import type { NextFunction, Request, Response } from "express";
import { serviceGetAllComments } from "../../../services/admin/comment/getAllComments.js";
import { sendSuccess } from "../../../utils/response.js";

export const getAllComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const result = await serviceGetAllComments(page, limit);
    sendSuccess(res, result, "Daftar komentar berhasil diambil");
  } catch (error) {
    next(error);
  }
};
