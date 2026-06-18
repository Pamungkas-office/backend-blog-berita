import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

export const validate = (schema: ZodSchema, source: "body" | "query" | "params" = "body") => {
    return (req: Request, _res: Response, next: NextFunction) => {
        try {
            const parsed = schema.parse(req[source]);
            req[source] = parsed;
            next();
        } catch (error) {
            next(error);
        }
    };
};
