import type { NextFunction, Request, Response } from "express";
import { getTotalViews } from "../../services/user/blog/pageView.service.js";
import { sendSuccess } from "../../utils/response.js";

export const getTotalViewsStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const total = await getTotalViews();
    sendSuccess(res, { total_views: total }, "Total views fetched");
  } catch (error) {
    next(error);
  }
};
