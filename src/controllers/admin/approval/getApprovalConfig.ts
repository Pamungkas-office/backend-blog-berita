import type { NextFunction, Request, Response } from "express";
import { serviceGetApprovalConfig } from "../../../services/admin/approval/approvalService.js";
import { sendSuccess } from "../../../utils/response.js";

export const getApprovalConfig = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const config = await serviceGetApprovalConfig();
    sendSuccess(res, config, "Konfigurasi approval berhasil diambil");
  } catch (error) {
    next(error);
  }
};
