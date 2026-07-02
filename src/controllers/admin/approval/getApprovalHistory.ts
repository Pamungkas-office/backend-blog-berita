import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceGetApprovalHistory } from "../../../services/admin/approval/approvalService.js";
import { sendSuccess } from "../../../utils/response.js";

const historySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20),
});

export const getApprovalHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit } = historySchema.parse(req.query);
    const result = await serviceGetApprovalHistory(page, limit);
    sendSuccess(res, result, "Riwayat approval berhasil diambil");
  } catch (error) {
    next(error);
  }
};
