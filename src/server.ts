import express, { json, urlencoded } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { error } from "./middleware/error.js";
import { notFound } from "./middleware/not-found.js";
import authRouter from "./routes/user/auth.routes.js";
import blogRouter from "./routes/user/blog.routes.js";
import categoryRouter from "./routes/user/category.routes.js";
import tagRouter from "./routes/user/tag.routes.js";
import adRouter from "./routes/user/ad.routes.js";
import passwordRouter from "./routes/user/password.routes.js";
import adminBlogRouter from "./routes/admin/blog.routes.js";
import adminCategoryRouter from "./routes/admin/category.routes.js";
import adminTagRouter from "./routes/admin/tag.routes.js";
import adminCommentRouter from "./routes/admin/comment.routes.js";
import adminAdRouter from "./routes/admin/ad.routes.js";
import adminStatsRouter from "./routes/admin/stats.routes.js";
import adminApprovalRouter from "./routes/admin/approval.routes.js";
import superAdminApprovalRouter from "./routes/super_admin/approval.routes.js";
import superAdminRouter from "./routes/super_admin/super-admin.routes.js";
import commentRoutes from "./routes/user/comment.routes.js";
import { validateEnv, getCorsOrigins } from "./config/env.js";
import { swaggerSpec } from "./config/swagger.js";

validateEnv();

const app = express();

app.use(helmet());
app.use(json({ limit: "10mb" }));
app.use(urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: getCorsOrigins(),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Visitor-Id"],
    credentials: true,
  }),
);

// Serve uploaded files
app.use("/uploads", express.static("uploads"));
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Blog API is running",
    timestamp: new Date().toISOString(),
  });
});

// Swagger documentation
app.use(
  "/api/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCssUrl:
      "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.32.8/swagger-ui.css",
    customJs: [
      "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.32.8/swagger-ui-bundle.js",
      "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.32.8/swagger-ui-standalone-preset.js",
    ],
  }),
);
app.get("/api/api-docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Routes
// Public
app.use("/api/posts", blogRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/tags", tagRouter);

// Comments
app.use("/api/comments", commentRoutes);

// Public ad
app.use("/api/ad-positions", adRouter);

// Auth
app.use("/api/auth", authRouter);

// Password reset
app.use("/api/password", passwordRouter);

// Admin
app.use("/api/admin/posts", adminBlogRouter);
app.use("/api/admin/categories", adminCategoryRouter);
app.use("/api/admin/tags", adminTagRouter);
app.use("/api/admin/comments", adminCommentRouter);
app.use("/api/admin/ad-positions", adminAdRouter);
app.use("/api/admin/stats", adminStatsRouter);
app.use("/api/admin/approval", adminApprovalRouter);
app.use("/api/super-admin/approval", superAdminApprovalRouter);
app.use("/api/admin/super-admin", superAdminRouter);

// Error handlers (harus di paling bawah)
app.use(notFound);
app.use(error);

export default app;
