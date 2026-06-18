import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { CustomError } from "../lib/custom-error.js";

export interface JwtPayload {
    id: string;
    email: string;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const verifyToken = (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.auth_token || req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
        return next(new CustomError("Authentication required", 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        req.user = decoded;
        next();
    } catch {
        return next(new CustomError("Invalid or expired token", 401));
    }
};
