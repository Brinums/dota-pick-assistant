import { Router } from "express";
import { getExternalApiLogs } from "../controllers/logs.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.get("/external-api", requireRole("ADMIN"), getExternalApiLogs);

export default router;
