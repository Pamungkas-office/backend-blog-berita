import express, { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import { error } from './middleware/error.ts';
import { notFound } from './middleware/not-found.ts';
import authRouter from './routes/user/auth.routes.ts';
import blogRouter from './routes/user/blog.routes.ts';
import categoryRouter from './routes/user/category.routes.ts';
import tagRouter from './routes/user/tag.routes.ts';
import adminBlogRouter from './routes/admin/blog.routes.ts';
import adminCategoryRouter from './routes/admin/category.routes.ts';
import adminTagRouter from './routes/admin/tag.routes.ts';
import { db } from './lib/db/db.ts';
import commentRoutes from './routes/user/comment.routes.ts';

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Set client dari drizzle agar tidak diimport terus 
app.set('db', db);

// Routes
// Public
app.use('/api/posts', blogRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/tags', tagRouter);

// Comments
app.use('/api/comments', commentRoutes);

// Auth
app.use('/api/auth', authRouter);

// Admin
app.use('/api/admin/posts', adminBlogRouter);
app.use('/api/admin/categories', adminCategoryRouter);
app.use('/api/admin/tags', adminTagRouter);

// Error handlers (harus di paling bawah)
app.use(notFound);
app.use(error);

export default app;
