import express from "express";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/admin.middleware.js";
import { getTotalViewsStats } from "../../controllers/admin/stats.controller.js";

const adminStatsRouter = express.Router();

adminStatsRouter.get("/total-views", verifyToken, requireAdmin, getTotalViewsStats);

export default adminStatsRouter;
