import type { NextFunction, Request, Response } from "express";
import { serviceDeleteCategory } from "../../../services/admin/category/deleteCategory.js";
import { sendSuccess } from "../../../utils/response.js";

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await serviceDeleteCategory(id);
    sendSuccess(res, null, "Kategori berhasil dihapus");
  } catch (error) {
    next(error);
  }
};
