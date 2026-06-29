import type { NextFunction, Request, Response } from "express";
import { serviceDeleteTag } from "../../../services/admin/tag/deleteTag.js";
import { sendSuccess } from "../../../utils/response.js";

/**
 * @openapi
 * /api/admin/tags/{id}:
 *   delete:
 *     tags: [Admin Tags]
 *     summary: Delete a tag
 *     description: Delete a tag by ID (requires admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tag ID
 *     responses:
 *       200:
 *         description: Tag deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Tag not found
 *       500:
 *         description: Internal server error
 */
export const deleteTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await serviceDeleteTag(id);
    sendSuccess(res, null, "Tag berhasil dihapus");
  } catch (error) {
    next(error);
  }
};
