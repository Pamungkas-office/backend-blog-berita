import type { NextFunction, Request, Response } from "express";
import { servicePublishPost } from "../../../services/admin/approval/approvalService.js";
import { sendSuccess } from "../../../utils/response.js";

export const publishPost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const result = await servicePublishPost(id);

    sendSuccess(res, result, "Post berhasil dipublikasikan");
  } catch (error) {
    next(error);
  }
};
