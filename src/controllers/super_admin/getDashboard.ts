import type { NextFunction, Request, Response } from "express";
import { serviceGetDashboard } from "../../services/super_admin/getDashboard.js";
import { sendSuccess } from "../../utils/response.js";

export const getDashboard = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await serviceGetDashboard();
    sendSuccess(res, data, "Dashboard data berhasil diambil");
  } catch (error) {
    next(error);
  }
};
