import express from "express";
import { getAllPublishedPost } from "../../controllers/blog/getAllPublishedPost.js";
import { getPostBySlug } from "../../controllers/blog/getPostBySlug.js";
import { recordPageViewController } from "../../controllers/blog/recordPageView.js";
import { optionalAuth } from "../../middleware/optional-auth.middleware.js";

const blogRouter = express.Router();

blogRouter.get("/", getAllPublishedPost);
blogRouter.get("/:slug", getPostBySlug);
blogRouter.post("/:slug/view", optionalAuth, recordPageViewController);

export default blogRouter;
