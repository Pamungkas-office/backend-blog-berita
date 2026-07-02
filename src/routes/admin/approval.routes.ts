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

const adminApprovalRouter = express.Router();

// All approval routes require authentication + admin role
adminApprovalRouter.use(verifyToken, requireAdmin);

// ── Approver actions (requireApprover) ──
adminApprovalRouter.post("/:id/approve", requireApprover, approvePost);
adminApprovalRouter.post("/:id/revision", requireApprover, revisionPost);

// ── Resubmit (admin biasa) ──
adminApprovalRouter.post("/:id/resubmit", resubmitPost);

// ── Publish (super_admin only) ──
adminApprovalRouter.post("/:id/publish", requireSuperAdmin, publishPost);

// ── Revision notes (any admin can read) ──
adminApprovalRouter.get("/:id/revision-notes", requireAdmin, getRevisionNotes);

// ── Queue & History ──
adminApprovalRouter.get("/queue", requireApprover, getApprovalQueue);
adminApprovalRouter.get("/history", requireApprover, getApprovalHistory);

// ── Config (super_admin only) ──
adminApprovalRouter.get("/config", requireSuperAdmin, getApprovalConfig);
adminApprovalRouter.put("/config", requireSuperAdmin, updateApprovalConfig);

// ── Master Admin management (super_admin only) ──
adminApprovalRouter.get("/master-admins", requireSuperAdmin, getMasterAdminList);
adminApprovalRouter.put("/master-admins/:userId", requireSuperAdmin, toggleMasterAdmin);

export default adminApprovalRouter;
