import type { NextFunction, Request, Response } from "express";
import { getPostIdBySlug, recordPageView } from "../../services/user/blog/pageView.service.js";
import { sendSuccess } from "../../utils/response.js";
import { CustomError } from "../../lib/custom-error.js";

export const recordPageViewController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug as string;
    const postId = await getPostIdBySlug(slug);

    if (!postId) {
      throw new CustomError("Post tidak ditemukan", 404);
    }

    const visitorId = (req.headers["x-visitor-id"] as string) || "";
    const userId = req.user?.id ? Number(req.user.id) : null;

    await recordPageView({ postId, userId, visitorId });

    sendSuccess(res, null, "View recorded");
  } catch (error) {
    next(error);
  }
};
