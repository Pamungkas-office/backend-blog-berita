import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { MulterError } from 'multer';
import { CustomError } from '../lib/custom-error.js';

export const error = (err: Error, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
        const errors = err.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
        }));

        return res.status(400).json({
            success: false,
            message: 'Validasi gagal',
            errors,
        });
    }

    if (err instanceof CustomError) {
        const statusCode = err.statusCode;

        try {
            const msg = JSON.parse(err.message);
            return res.status(statusCode).json({ success: false, ...msg });
        } catch {
            return res.status(statusCode).json({ success: false, message: err.message });
        }
    }

    if (err instanceof MulterError) {
        const messages: Record<string, string> = {
            LIMIT_FILE_SIZE: 'Ukuran file terlalu besar. Maksimal 2MB',
            LIMIT_FILE_COUNT: 'Terlalu banyak file',
            LIMIT_UNEXPECTED_FILE: 'Tipe file tidak sesuai',
        };

        return res.status(400).json({
            success: false,
            message: messages[err.code] || 'Terjadi kesalahan saat upload file',
        });
    }

    console.error('[ERROR]', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
};
