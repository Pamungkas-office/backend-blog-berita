import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceApprovePost } from "../../../services/admin/approval/approvalService.js";
import { sendSuccess } from "../../../utils/response.js";

export const approvePost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const result = await serviceApprovePost(id, Number(req.user!.id));

    sendSuccess(res, result, "Post berhasil di-approve");
  } catch (error) {
    next(error);
  }
};
