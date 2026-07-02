import express from "express";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { requireSuperAdmin } from "../../middleware/super-admin.middleware.js";
import { requireAdmin } from "../../middleware/admin.middleware.js";

import { getDashboard } from "../../controllers/super_admin/getDashboard.js";
import { getUsers } from "../../controllers/super_admin/getUsers.js";
import { createAdmin } from "../../controllers/super_admin/createAdmin.js";

import { updateAdmin } from "../../controllers/super_admin/updateAdmin.js";
import { deleteUser } from "../../controllers/super_admin/deleteUser.js";

const superAdminRouter = express.Router();

superAdminRouter.use(verifyToken, requireAdmin);

superAdminRouter.get("/dashboard", requireSuperAdmin, getDashboard);
superAdminRouter.get("/users", requireSuperAdmin, getUsers);
superAdminRouter.post("/users", requireSuperAdmin, createAdmin);
superAdminRouter.put("/users/:userId", requireSuperAdmin, updateAdmin);
superAdminRouter.delete("/users/:userId", requireSuperAdmin, deleteUser);

export default superAdminRouter;
