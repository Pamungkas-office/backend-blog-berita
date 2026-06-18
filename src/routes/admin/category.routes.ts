import express from 'express';
import { verifyToken } from '../../middleware/auth.middleware.ts';
import { requireAdmin } from '../../middleware/admin.middleware.ts';
import { createCategory } from '../../controllers/admin/category/createCategory.ts';
import { updateCategory } from '../../controllers/admin/category/updateCategory.ts';
import { deleteCategory } from '../../controllers/admin/category/deleteCategory.ts';

const adminCategoryRouter = express.Router();

adminCategoryRouter.post('/', verifyToken, requireAdmin, createCategory);
adminCategoryRouter.put('/:id', verifyToken, requireAdmin, updateCategory);
adminCategoryRouter.delete('/:id', verifyToken, requireAdmin, deleteCategory);

export default adminCategoryRouter;
