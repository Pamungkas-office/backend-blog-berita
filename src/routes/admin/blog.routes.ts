import express from 'express';
import { verifyToken } from '../../middleware/auth.middleware.ts';
import { requireAdmin } from '../../middleware/admin.middleware.ts';
import { upload } from '../../lib/upload.ts';
import { getAllNews } from '../../controllers/admin/blog/getAllNews.ts';
import { createNewNews } from '../../controllers/admin/blog/createNewNews.ts';
import { updateNews } from '../../controllers/admin/blog/updateNews.ts';
import { deleteNews } from '../../controllers/admin/blog/deleteNews.ts';
import { getNewsById } from '../../controllers/admin/blog/getNewsById.ts';

const adminBlogRouter = express.Router();

adminBlogRouter.get('/', verifyToken, requireAdmin, getAllNews);
adminBlogRouter.post('/', verifyToken, requireAdmin, upload.single('thumbnail'), createNewNews);
adminBlogRouter.get('/:id', verifyToken, requireAdmin, getNewsById);
adminBlogRouter.put('/:id', verifyToken, requireAdmin, upload.single('thumbnail'), updateNews);
adminBlogRouter.delete('/:id', verifyToken, requireAdmin, deleteNews);

export default adminBlogRouter;
