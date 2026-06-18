import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceCreateCategory } from "../../../services/admin/category/createCategory.ts";
import { sendSuccess } from "../../../utils/response.ts";

const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  slug: z.string().min(1, "Slug kategori wajib diisi"),
});

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = categorySchema.parse(req.body);
    const category = await serviceCreateCategory(data.name, data.slug);
    sendSuccess(res, category, "Kategori berhasil dibuat", 201);
  } catch (error) {
    next(error);
  }
};
