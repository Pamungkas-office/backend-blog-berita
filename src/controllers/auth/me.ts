import type { NextFunction, Request, Response } from "express";
import { serviceGetMe } from "../../services/auth/getMe.js";
import { sendSuccess } from "../../utils/response.js";

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await serviceGetMe(req.user!.id);
    sendSuccess(res, user, "Data user berhasil diambil");
  } catch (error) {
    next(error);
  }
};
