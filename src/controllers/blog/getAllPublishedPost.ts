import type { NextFunction, Request, Response } from "express";
import { serviceGetPublishedPosts } from "../../services/user/blog/getPublishedPosts.ts";
import { sendSuccess } from "../../utils/response.ts";

export const getAllPublishedPost = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await serviceGetPublishedPosts();
    sendSuccess(res, posts, "Daftar post berhasil diambil");
  } catch (error) {
    next(error);
  }
};
