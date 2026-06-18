import type { NextFunction, Request, Response } from "express";
import { getAllNewsAdmin } from "../../../services/admin/blog/getAllNews.ts";
import { sendSuccess } from "../../../utils/response.ts";

export const getAllNews = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const news = await getAllNewsAdmin();
    sendSuccess(res, news, "Daftar berita berhasil diambil");
  } catch (error) {
    next(error);
  }
};
