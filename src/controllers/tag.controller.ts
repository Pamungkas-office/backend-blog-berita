import type { NextFunction, Request, Response } from "express";
import { db } from "../lib/db/db.js";
import { tags } from "../lib/db/schema.js";
import { sendSuccess } from "../utils/response.js";

/**
 * @openapi
 * /api/tags:
 *   get:
 *     tags: [Tags]
 *     summary: Get all tags
 *     description: Retrieve a list of all tags ordered by name
 *     responses:
 *       200:
 *         description: List of tags
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Daftar tag berhasil diambil
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       slug:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
export const getAllTags = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await db.select().from(tags).orderBy(tags.name);
    sendSuccess(res, data, "Daftar tag berhasil diambil");
  } catch (error) {
    next(error);
  }
};
