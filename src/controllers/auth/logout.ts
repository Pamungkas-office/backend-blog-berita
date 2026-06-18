import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/response.ts";

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("auth_token");
  sendSuccess(res, null, "Logout berhasil");
};
