import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceCreatePost } from "../../../services/admin/blog/createNews.ts";
import { sendSuccess } from "../../../utils/response.ts";
import { generateSlug } from "../../../utils/slug.ts";

export const createNewsSchema = z.object({
  title: z.string(),
  content: z.string(),
  status: z.enum(["draft", "published"]),

  category_id: z.coerce.number({
    error: "Category ID harus berupa angka",
  }).positive("Category ID tidak valid"),

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

  thumbnail: z.string().optional().nullable(),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
});

export const createNewNews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = createNewsSchema.parse(req.body);
    const slug = generateSlug(data.title);

    const post = await serviceCreatePost(
      Number(req.user!.id),
      {
        title: data.title,
        slug,
        content: data.content,
        category_id: data.category_id,
        status: data.status,
        meta_title: data.meta_title ?? null,
        meta_description: data.meta_description ?? null,
        tag_ids: data.tag_ids,
      },
      req.file,
    );

    sendSuccess(res, post, "Berita berhasil dibuat", 201);
  } catch (error) {
    next(error);
  }
};
