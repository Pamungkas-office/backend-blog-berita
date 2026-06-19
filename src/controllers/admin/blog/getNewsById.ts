import type { NextFunction, Request, Response } from "express";
import { serviceGetPostById } from "../../../services/admin/blog/getPostById.js";
import { sendSuccess } from "../../../utils/response.js";

export const getNewsById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const post = await serviceGetPostById(id);
    sendSuccess(res, post, "Detail berita berhasil diambil");
  } catch (error) {
    next(error);
  }
};
