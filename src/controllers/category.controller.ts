import type { NextFunction, Request, Response } from "express";
import { db } from "../lib/db/db.js";
import { categories } from "../lib/db/schema.js";
import { sendSuccess } from "../utils/response.js";

/**
 * @openapi
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories
 *     description: Retrieve a list of all categories ordered by name
 *     responses:
 *       200:
 *         description: List of categories
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
 *                   example: Daftar kategori berhasil diambil
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
export const getAllCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await db.select().from(categories).orderBy(categories.name);
    sendSuccess(res, data, "Daftar kategori berhasil diambil");
  } catch (error) {
    next(error);
  }
};
