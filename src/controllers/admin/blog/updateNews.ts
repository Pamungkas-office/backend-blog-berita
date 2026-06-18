import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceUpdatePost } from "../../../services/admin/blog/updateNews.ts";
import { sendSuccess } from "../../../utils/response.ts";
import { generateSlug } from "../../../utils/slug.ts";

const updatePostSchema = z.object({
  title: z.string().min(5, "Minimal 5 karakter untuk judul").optional(),
  slug: z.string().optional(),
  content: z.string().min(15, "Minimal 15 karakter untuk isi").optional(),
  category_id: z.number().int().positive().optional(),
  status: z.enum(["draft", "published"]).optional(),
  thumbnail: z.string().nullable().optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  tag_ids: z.array(z.number().int().positive()).optional(),
});

export const updateNews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = updatePostSchema.parse(req.body);

    let slug = data.slug;
    if (data.title && !data.slug) {
      slug = generateSlug(data.title);
    }

    const thumbnail = req.file
      ? `/uploads/thumbnails/${req.file.filename}`
      : data.thumbnail;

    const post = await serviceUpdatePost(id, {
      title: data.title,
      slug,
      content: data.content,
      category_id: data.category_id,
      status: data.status,
      thumbnail: thumbnail ?? null,
      meta_title: data.meta_title ?? null,
      meta_description: data.meta_description ?? null,
      tag_ids: data.tag_ids,
    });

    sendSuccess(res, post, "Berita berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};
