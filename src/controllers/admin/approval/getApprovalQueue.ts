import type { NextFunction, Request, Response } from "express";
import { serviceGetApprovalQueue } from "../../../services/admin/approval/approvalService.js";
import { sendSuccess } from "../../../utils/response.js";

export const getApprovalQueue = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const result = await serviceGetApprovalQueue(page, limit);
    sendSuccess(res, result, "Antrian approval berhasil diambil");
  } catch (error) {
    next(error);
  }
};
