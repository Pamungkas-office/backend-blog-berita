import type { NextFunction, Request, Response } from "express";
import { serviceGetRevisionNotes } from "../../../services/admin/approval/approvalService.js";
import { sendSuccess } from "../../../utils/response.js";

export const getRevisionNotes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const postId = Number(req.params.id);
    const result = await serviceGetRevisionNotes(postId);
    sendSuccess(res, result, "Catatan revisi berhasil diambil");
  } catch (error) {
    next(error);
  }
};
