import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceCreateTag } from "../../../services/admin/tag/createTag.js";
import { sendSuccess } from "../../../utils/response.js";

const tagSchema = z.object({
  name: z.string().min(1, "Nama tag wajib diisi"),
  slug: z.string().min(1, "Slug tag wajib diisi"),
});

export const createTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = tagSchema.parse(req.body);
    const tag = await serviceCreateTag(data.name, data.slug);
    sendSuccess(res, tag, "Tag berhasil dibuat", 201);
  } catch (error) {
    next(error);
  }
};
