import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceUpdateUserRole } from "../../services/super_admin/updateUserRole.js";
import { sendSuccess } from "../../utils/response.js";

const updateRoleSchema = z.object({
  role: z.enum(["admin", "user"]),
});

export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = Number(req.params.userId);
    const { role } = updateRoleSchema.parse(req.body);

    const result = await serviceUpdateUserRole(userId, role);
    sendSuccess(res, result, "Role user berhasil diubah");
  } catch (error) {
    next(error);
  }
};
