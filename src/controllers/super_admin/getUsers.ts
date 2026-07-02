import type { NextFunction, Request, Response } from "express";
import { serviceGetUsers } from "../../services/super_admin/getUsers.js";
import { sendSuccess } from "../../utils/response.js";

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const result = await serviceGetUsers(page, limit);
    sendSuccess(res, result, "Daftar user berhasil diambil");
  } catch (error) {
    next(error);
  }
};
