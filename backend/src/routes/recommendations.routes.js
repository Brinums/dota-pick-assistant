import { Router } from "express";
import {
  cancelRecommendationSyncJob,
  createRecommendationsAdaptive,
  createRecommendations,
  deleteRecommendation,
  getRecommendationSyncJobStatus,
  getAllRecommendationsAdmin,
  getMyRecommendations,
  getRecommendationById,
  startRecommendationSyncJob,
  syncRecommendationData,
  updateRecommendation,
} from "../controllers/recommendations.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.post("/", createRecommendationsAdaptive);
router.post("/sync", requireRole("ADMIN"), syncRecommendationData);
router.post("/sync/start", requireRole("ADMIN"), startRecommendationSyncJob);
router.get("/sync/status", requireRole("ADMIN"), getRecommendationSyncJobStatus);
router.post("/sync/cancel", requireRole("ADMIN"), cancelRecommendationSyncJob);
router.post("/legacy", createRecommendations);
router.get("/me", getMyRecommendations);
router.get("/all", requireRole("ADMIN"), getAllRecommendationsAdmin);
router.get("/:id", getRecommendationById);
router.patch("/:id", updateRecommendation);
router.delete("/:id", deleteRecommendation);

export default router;
