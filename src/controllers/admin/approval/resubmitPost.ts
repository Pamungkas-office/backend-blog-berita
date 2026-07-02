import type { NextFunction, Request, Response } from "express";
import { serviceResubmitPost } from "../../../services/admin/approval/approvalService.js";
import { sendSuccess } from "../../../utils/response.js";

export const resubmitPost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const result = await serviceResubmitPost(id);

    sendSuccess(res, result, "Post berhasil di-resubmit untuk approval");
  } catch (error) {
    next(error);
  }
};
