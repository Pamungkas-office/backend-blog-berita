import type { NextFunction, Request, Response } from "express";
import { db } from "../lib/db/db.ts";
import { tags } from "../lib/db/schema.ts";
import { sendSuccess } from "../utils/response.ts";

export const getAllTags = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await db.select().from(tags).orderBy(tags.name);
    sendSuccess(res, data, "Daftar tag berhasil diambil");
  } catch (error) {
    next(error);
  }
};
