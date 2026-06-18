import type { NextFunction, Request, Response } from "express";
import { serviceDeletePost } from "../../../services/admin/blog/deleteNews.ts";
import { sendSuccess } from "../../../utils/response.ts";

export const deleteNews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await serviceDeletePost(id);
    sendSuccess(res, null, "Berita berhasil dihapus");
  } catch (error) {
    next(error);
  }
};
