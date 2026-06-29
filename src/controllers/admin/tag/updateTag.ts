import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceUpdateTag } from "../../../services/admin/tag/updateTag.js";
import { sendSuccess } from "../../../utils/response.js";

const tagSchema = z.object({
  name: z.string().min(1, "Nama tag wajib diisi"),
  slug: z.string().min(1, "Slug tag wajib diisi"),
});

/**
 * @openapi
 * /api/admin/tags/{id}:
 *   put:
 *     tags: [Admin Tags]
 *     summary: Update a tag
 *     description: Update an existing tag by ID (requires admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tag ID
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
 *                 example: JS
 *               slug:
 *                 type: string
 *                 example: js
 *     responses:
 *       200:
 *         description: Tag updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Tag not found
 *       409:
 *         description: Slug already used
 *       500:
 *         description: Internal server error
 */
export const updateTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = tagSchema.parse(req.body);
    const tag = await serviceUpdateTag(id, data.name, data.slug);
    sendSuccess(res, tag, "Tag berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};
