import express from 'express';
import { verifyToken } from '../../middleware/auth.middleware.ts';
import { requireAdmin } from '../../middleware/admin.middleware.ts';
import { createTag } from '../../controllers/admin/tag/createTag.ts';
import { updateTag } from '../../controllers/admin/tag/updateTag.ts';
import { deleteTag } from '../../controllers/admin/tag/deleteTag.ts';

const adminTagRouter = express.Router();

adminTagRouter.post('/', verifyToken, requireAdmin, createTag);
adminTagRouter.put('/:id', verifyToken, requireAdmin, updateTag);
adminTagRouter.delete('/:id', verifyToken, requireAdmin, deleteTag);

export default adminTagRouter;
