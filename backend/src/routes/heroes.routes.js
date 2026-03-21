import { Router } from "express";
import {
  createHero,
  deleteHero,
  getHeroById,
  listHeroes,
  syncHeroes,
  syncRecentMatches,
  updateHero,
} from "../controllers/heroes.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", listHeroes);
router.get("/:id", getHeroById);
router.post("/", requireAuth, requireRole("ADMIN"), createHero);
router.patch("/:id", requireAuth, requireRole("ADMIN"), updateHero);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteHero);
router.post("/sync", requireAuth, requireRole("ADMIN"), syncHeroes);
router.post("/sync-matches", requireAuth, requireRole("ADMIN"), syncRecentMatches);

export default router;
