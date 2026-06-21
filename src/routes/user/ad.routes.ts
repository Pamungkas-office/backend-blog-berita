import express from "express";
import { getActiveAd } from "../../controllers/user/adController.js";

const adRouter = express.Router();

adRouter.get("/:position", getActiveAd);

export default adRouter;
