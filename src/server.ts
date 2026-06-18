import express, { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import { error } from './middleware/error.js';
import { notFound } from './middleware/not-found.js';
import authRouter from './routes/user/auth.routes.js';
import blogRouter from './routes/user/blog.routes.js';
import categoryRouter from './routes/user/category.routes.js';
import tagRouter from './routes/user/tag.routes.js';
import adminBlogRouter from './routes/admin/blog.routes.js';
import adminCategoryRouter from './routes/admin/category.routes.js';
import adminTagRouter from './routes/admin/tag.routes.js';
import { db } from './lib/db/db.js';
import commentRoutes from './routes/user/comment.routes.js';
import cors from 'cors';

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173/',
    credentials: true
}))

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/', (_req, res) => {
    res.json({ success: true, message: 'Blog API is running', timestamp: new Date().toISOString() });
});

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
