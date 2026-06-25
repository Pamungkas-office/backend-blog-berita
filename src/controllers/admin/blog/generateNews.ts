import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceGenerateContent } from "../../../services/admin/blog/generateNews.js";
import { sendSuccess } from "../../../utils/response.js";

export const generateNewsSchema = z.object({
  url: z.string({ message: "URL berita wajib diisi" }),
});

export const generateNews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { url } = generateNewsSchema.parse(req.body);
    const content = await serviceGenerateContent(url);

    sendSuccess(res, content, "Berita berhasil digenerate", 200);
  } catch (error) {
    next(error);
  }
};
