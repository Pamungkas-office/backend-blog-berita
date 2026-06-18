import type { NextFunction, Request, Response } from "express";
import { CustomError } from "../lib/custom-error.ts";

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "admin") {
    return next(new CustomError("Akses ditolak. Hanya admin yang diizinkan", 403));
  }
  next();
};
