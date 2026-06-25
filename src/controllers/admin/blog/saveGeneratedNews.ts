import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceSaveGenerated } from "../../../services/admin/blog/saveGeneratedNews.js";
import { sendSuccess } from "../../../utils/response.js";

export const saveGeneratedNewsSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  news: z.string().min(1, "Konten berita wajib diisi"),
  category: z
    .array(z.string())
    .min(1, "Minimal 1 kategori")
    .max(3, "Maksimal 3 kategori"),
  tags: z
    .array(z.string())
    .min(1, "Minimal 1 tag")
    .max(5, "Maksimal 5 tag"),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
});

export const saveGeneratedNews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = saveGeneratedNewsSchema.parse(req.body);

    const post = await serviceSaveGenerated(Number(req.user!.id), {
      title: data.title,
      news: data.news,
      category: data.category,
      tags: data.tags,
      meta_title: data.meta_title ?? null,
      meta_description: data.meta_description ?? null,
    });

    sendSuccess(res, post, "Berita berhasil disimpan sebagai draft", 201);
  } catch (error) {
    next(error);
  }
};
