import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceUpdateTag } from "../../../services/admin/tag/updateTag.js";
import { sendSuccess } from "../../../utils/response.js";

const tagSchema = z.object({
  name: z.string().min(1, "Nama tag wajib diisi"),
  slug: z.string().min(1, "Slug tag wajib diisi"),
});

export const updateTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = tagSchema.parse(req.body);
    const tag = await serviceUpdateTag(id, data.name, data.slug);
    sendSuccess(res, tag, "Tag berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};
