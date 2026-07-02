import express from "express";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/admin.middleware.js";
import { requireApprover } from "../../middleware/approver.middleware.js";
import { requireSuperAdmin } from "../../middleware/super-admin.middleware.js";

import { approvePost } from "../../controllers/admin/approval/approvePost.js";
import { revisionPost } from "../../controllers/admin/approval/revisionPost.js";
import { publishPost } from "../../controllers/admin/approval/publishPost.js";
import { getApprovalQueue } from "../../controllers/admin/approval/getApprovalQueue.js";
import { getApprovalHistory } from "../../controllers/admin/approval/getApprovalHistory.js";
import { getApprovalConfig } from "../../controllers/admin/approval/getApprovalConfig.js";
import { updateApprovalConfig } from "../../controllers/admin/approval/updateApprovalConfig.js";
import { getMasterAdminList } from "../../controllers/admin/approval/getMasterAdminList.js";
import { toggleMasterAdmin } from "../../controllers/admin/approval/toggleMasterAdmin.js";
import { resubmitPost } from "../../controllers/admin/approval/resubmitPost.js";
import { getRevisionNotes } from "../../controllers/admin/approval/getRevisionNotes.js";

const superAdminApprovalRouter = express.Router();

// All approval routes require authentication + admin/super_admin role
superAdminApprovalRouter.use(verifyToken, requireAdmin);

// ── Approver actions (requireApprover) ──
superAdminApprovalRouter.post("/:id/approve", requireApprover, approvePost);
superAdminApprovalRouter.post("/:id/revision", requireApprover, revisionPost);

// ── Resubmit (admin biasa) ──
superAdminApprovalRouter.post("/:id/resubmit", resubmitPost);

// ── Publish (super_admin only) ──
superAdminApprovalRouter.post("/:id/publish", requireSuperAdmin, publishPost);

// ── Revision notes (any admin can read) ──
superAdminApprovalRouter.get("/:id/revision-notes", requireAdmin, getRevisionNotes);

// ── Queue & History ──
superAdminApprovalRouter.get("/queue", requireApprover, getApprovalQueue);
superAdminApprovalRouter.get("/history", requireApprover, getApprovalHistory);

// ── Config (super_admin only) ──
superAdminApprovalRouter.get("/config", requireSuperAdmin, getApprovalConfig);
superAdminApprovalRouter.put("/config", requireSuperAdmin, updateApprovalConfig);

// ── Master Admin management (super_admin only) ──
superAdminApprovalRouter.get(
  "/master-admins",
  requireSuperAdmin,
  getMasterAdminList,
);
superAdminApprovalRouter.put(
  "/master-admins/:userId",
  requireSuperAdmin,
  toggleMasterAdmin,
);

export default superAdminApprovalRouter;
