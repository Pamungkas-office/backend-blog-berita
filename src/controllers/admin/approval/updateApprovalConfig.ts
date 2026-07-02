import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceUpdateApprovalConfig } from "../../../services/admin/approval/approvalService.js";
import { sendSuccess } from "../../../utils/response.js";

const updateConfigSchema = z.object({
  min_admin_approvals: z.coerce
    .number()
    .min(1, "Minimal 1 admin approval"),
});

export const updateApprovalConfig = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { min_admin_approvals } = updateConfigSchema.parse(req.body);
    const config = await serviceUpdateApprovalConfig(min_admin_approvals);
    sendSuccess(res, config, "Konfigurasi approval berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};
