import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceUpdateCategory } from "../../../services/admin/category/updateCategory.js";
import { sendSuccess } from "../../../utils/response.js";

const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  slug: z.string().min(1, "Slug kategori wajib diisi"),
});

/**
 * @openapi
 * /api/admin/categories/{id}:
 *   put:
 *     tags: [Admin Categories]
 *     summary: Update a category
 *     description: Update an existing category by ID (requires admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
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
 *                 example: Teknologi Update
 *               slug:
 *                 type: string
 *                 example: teknologi-update
 *     responses:
 *       200:
 *         description: Category updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Category not found
 *       409:
 *         description: Slug already used
 *       500:
 *         description: Internal server error
 */
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = categorySchema.parse(req.body);
    const category = await serviceUpdateCategory(id, data.name, data.slug);
    sendSuccess(res, category, "Kategori berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};
