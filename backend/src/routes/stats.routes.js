import { Router } from "express";
import { getHeroStatistics } from "../controllers/stats.controller.js";

const router = Router();

router.get("/heroes", getHeroStatistics);

export default router;
