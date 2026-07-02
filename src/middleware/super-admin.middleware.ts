import type { NextFunction, Request, Response } from "express";
import { CustomError } from "../lib/custom-error.js";

export const requireSuperAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return next(new CustomError("Unauthorized", 401));
  }

  if (req.user.role !== "super_admin") {
    return next(new CustomError("Akses ditolak. Hanya Super Admin", 403));
  }

  next();
};
