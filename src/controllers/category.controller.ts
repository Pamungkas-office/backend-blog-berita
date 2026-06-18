import type { NextFunction, Request, Response } from "express";
import { db } from "../lib/db/db.ts";
import { categories } from "../lib/db/schema.ts";
import { sendSuccess } from "../utils/response.ts";

export const getAllCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await db.select().from(categories).orderBy(categories.name);
    sendSuccess(res, data, "Daftar kategori berhasil diambil");
  } catch (error) {
    next(error);
  }
};
