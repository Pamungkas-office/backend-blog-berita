import type { Response } from "express";

export const sendSuccess = (res: Response, data: unknown, message: string = "Success", statusCode: number = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};