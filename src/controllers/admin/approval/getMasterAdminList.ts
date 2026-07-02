import type { NextFunction, Request, Response } from "express";
import { serviceGetMasterAdminList } from "../../../services/admin/approval/approvalService.js";
import { sendSuccess } from "../../../utils/response.js";

export const getMasterAdminList = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const admins = await serviceGetMasterAdminList();
    sendSuccess(res, admins, "Daftar master admin berhasil diambil");
  } catch (error) {
    next(error);
  }
};
