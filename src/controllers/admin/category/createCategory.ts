import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceCreateCategory } from "../../../services/admin/category/createCategory.js";
import { sendSuccess } from "../../../utils/response.js";

const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  slug: z.string().min(1, "Slug kategori wajib diisi"),
});

/**
 * @openapi
 * /api/admin/categories:
 *   post:
 *     tags: [Admin Categories]
 *     summary: Create a category
 *     description: Create a new category (requires admin)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 example: Teknologi
 *               slug:
 *                 type: string
 *                 example: teknologi
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       409:
 *         description: Slug already used
 *       500:
 *         description: Internal server error
 */
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = categorySchema.parse(req.body);
    const category = await serviceCreateCategory(data.name, data.slug);
    sendSuccess(res, category, "Kategori berhasil dibuat", 201);
  } catch (error) {
    next(error);
  }
};
