import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceUpdateCategory } from "../../../services/admin/category/updateCategory.ts";
import { sendSuccess } from "../../../utils/response.ts";

const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  slug: z.string().min(1, "Slug kategori wajib diisi"),
});

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = categorySchema.parse(req.body);
    const category = await serviceUpdateCategory(id, data.name, data.slug);
    sendSuccess(res, category, "Kategori berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};
