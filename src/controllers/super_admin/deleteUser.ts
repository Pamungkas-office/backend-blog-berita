import type { NextFunction, Request, Response } from "express";
import { serviceDeleteUser } from "../../services/super_admin/deleteUser.js";
import { sendSuccess } from "../../utils/response.js";

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = Number(req.params.userId);
    const result = await serviceDeleteUser(userId);
    sendSuccess(res, result, "User berhasil dihapus");
  } catch (error) {
    next(error);
  }
};
