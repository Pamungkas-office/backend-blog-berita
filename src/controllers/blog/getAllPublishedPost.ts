import type { NextFunction, Request, Response } from "express";
import { serviceGetPublishedPosts } from "../../services/user/blog/getPublishedPosts.js";
import { sendSuccess } from "../../utils/response.js";

export const getAllPublishedPost = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await serviceGetPublishedPosts();
    sendSuccess(res, posts, "Daftar post berhasil diambil");
  } catch (error) {
    next(error);
  }
};
