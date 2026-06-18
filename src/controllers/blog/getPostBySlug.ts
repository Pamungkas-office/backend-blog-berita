import type { NextFunction, Request, Response } from "express";
import { serviceGetPostBySlug } from "../../services/user/blog/getPostBySlug.ts";
import { sendSuccess } from "../../utils/response.ts";

export const getPostBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug as string;
    const post = await serviceGetPostBySlug(slug);
    sendSuccess(res, post, "Detail post berhasil diambil");
  } catch (error) {
    next(error);
  }
};
