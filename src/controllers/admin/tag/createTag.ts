import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceCreateTag } from "../../../services/admin/tag/createTag.js";
import { sendSuccess } from "../../../utils/response.js";

const tagSchema = z.object({
  name: z.string().min(1, "Nama tag wajib diisi"),
  slug: z.string().min(1, "Slug tag wajib diisi"),
});

/**
 * @openapi
 * /api/admin/tags:
 *   post:
 *     tags: [Admin Tags]
 *     summary: Create a tag
 *     description: Create a new tag (requires admin)
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
 *                 example: JavaScript
 *               slug:
 *                 type: string
 *                 example: javascript
 *     responses:
 *       201:
 *         description: Tag created
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
export const createTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = tagSchema.parse(req.body);
    const tag = await serviceCreateTag(data.name, data.slug);
    sendSuccess(res, tag, "Tag berhasil dibuat", 201);
  } catch (error) {
    next(error);
  }
};
