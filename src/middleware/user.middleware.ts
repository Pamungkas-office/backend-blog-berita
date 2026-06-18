import type { NextFunction, Request, Response } from "express";
import { CustomError } from "../lib/custom-error.ts";

export const requireUser = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "user") {
    return next(new CustomError("Akses ditolak. Anda belum login", 403));
  }
  next();
};
