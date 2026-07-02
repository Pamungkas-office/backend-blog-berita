import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { serviceUpdateAdmin } from "../../services/super_admin/updateAdmin.js";
import { sendSuccess } from "../../utils/response.js";

const updateAdminSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").optional(),
  email: z.string().email("Email tidak valid").optional(),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .optional()
    .or(z.literal("")),
  is_approver: z.boolean().optional(),
});

export const updateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = Number(req.params.userId);
    const parsed = updateAdminSchema.parse(req.body);

    const result = await serviceUpdateAdmin(userId, {
      ...parsed,
      password: parsed.password || undefined,
    });

    sendSuccess(res, result, "Admin berhasil diperbarui");
  } catch (error) {
    next(error);
  }
};
