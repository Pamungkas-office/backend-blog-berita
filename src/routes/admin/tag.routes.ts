import express from 'express';
import { verifyToken } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/admin.middleware.js';
import { createTag } from '../../controllers/admin/tag/createTag.js';
import { updateTag } from '../../controllers/admin/tag/updateTag.js';
import { deleteTag } from '../../controllers/admin/tag/deleteTag.js';

const adminTagRouter = express.Router();

adminTagRouter.post('/', verifyToken, requireAdmin, createTag);
adminTagRouter.put('/:id', verifyToken, requireAdmin, updateTag);
adminTagRouter.delete('/:id', verifyToken, requireAdmin, deleteTag);

export default adminTagRouter;
