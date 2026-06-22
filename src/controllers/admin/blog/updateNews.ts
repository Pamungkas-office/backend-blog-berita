import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceUpdatePost } from "../../../services/admin/blog/updateNews.js";
import { sendSuccess } from "../../../utils/response.js";
import { generateSlug } from "../../../utils/slug.js";
import { MediaService } from "../../../lib/upload.js";

const updatePostSchema = z.object({
  title: z.string().min(5, "Minimal 5 karakter untuk judul").optional(),
  slug: z.string().optional(),
  content: z.string().min(15, "Minimal 15 karakter untuk isi").optional(),
  category_id: z.coerce.number({
    error: "Category ID harus berupa angka",
  }).positive("Category ID tidak valid").optional(),
  status: z.enum(["draft", "published"]).optional(),
  thumbnail: z.string().nullable().optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  tag_ids: z
    .preprocess((val) => {
      if (typeof val === "string") {
        if (val === "") return undefined;
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    }, z.array(z.number()))
    .optional(),
});

export const updateNews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = updatePostSchema.parse(req.body);

    let slug = data.slug;
    if (data.title && !data.slug) {
      slug = generateSlug(data.title);
    }

    let thumbnail = data.thumbnail;
    if (req.file) {
      thumbnail = await MediaService.uploadThumbnail(req.file);
    }

    const post = await serviceUpdatePost(id, {
      title: data.title,
      slug,
      content: data.content,
      category_id: data.category_id,
      status: data.status,
      thumbnail,
      meta_title: data.meta_title ?? null,
      meta_description: data.meta_description ?? null,
      tag_ids: data.tag_ids,
    });

    sendSuccess(res, post, "Berita berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};
