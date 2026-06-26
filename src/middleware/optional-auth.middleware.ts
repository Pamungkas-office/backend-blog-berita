import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "./auth.middleware.js";

export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.auth_token || req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
  } catch {
    // Token invalid — proceed without user
  }

  next();
};
