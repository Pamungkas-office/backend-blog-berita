import type { NextFunction, Request, Response } from "express";
import { serviceGetProfile } from "../../services/auth/getProfile.js";
import { sendSuccess } from "../../utils/response.js";

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await serviceGetProfile(req.user!.id);
    sendSuccess(res, profile, "Profile berhasil diambil");
  } catch (error) {
    next(error);
  }
};
