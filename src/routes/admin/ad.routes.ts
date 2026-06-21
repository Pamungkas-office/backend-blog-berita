import express from "express";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { requireAdmin } from "../../middleware/admin.middleware.js";
import { getAllAds } from "../../controllers/admin/ad/getAllAds.js";
import { createAd } from "../../controllers/admin/ad/createAd.js";
import { updateAd } from "../../controllers/admin/ad/updateAd.js";
import { deleteAd } from "../../controllers/admin/ad/deleteAd.js";

const adminAdRouter = express.Router();

adminAdRouter.use(verifyToken, requireAdmin);

adminAdRouter.get("/", getAllAds);
adminAdRouter.post("/", createAd);
adminAdRouter.put("/:id", updateAd);
adminAdRouter.delete("/:id", deleteAd);

export default adminAdRouter;
