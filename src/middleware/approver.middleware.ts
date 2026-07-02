import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../lib/db/db.js";
import { masterAdmin } from "../lib/db/schema.js";
import { CustomError } from "../lib/custom-error.js";

export const requireApprover = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      return next(new CustomError("Unauthorized", 401));
    }

    // Super admin always has approval rights
    if (req.user.role === "super_admin") {
      return next();
    }

    // Check master_admin.is_approver for regular admin
    const [admin] = await db
      .select()
      .from(masterAdmin)
      .where(eq(masterAdmin.user_id, Number(req.user.id)))
      .limit(1);

    if (!admin?.is_approver) {
      return next(
        new CustomError("Anda tidak memiliki hak approval", 403),
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
