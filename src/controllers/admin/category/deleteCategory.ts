import type { NextFunction, Request, Response } from "express";
import { serviceDeleteCategory } from "../../../services/admin/category/deleteCategory.js";
import { sendSuccess } from "../../../utils/response.js";

/**
 * @openapi
 * /api/admin/categories/{id}:
 *   delete:
 *     tags: [Admin Categories]
 *     summary: Delete a category
 *     description: Delete a category by ID (requires admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await serviceDeleteCategory(id);
    sendSuccess(res, null, "Kategori berhasil dihapus");
  } catch (error) {
    next(error);
  }
};
