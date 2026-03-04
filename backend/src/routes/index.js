import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import authRoutes from "./auth.routes.js";
import heroesRoutes from "./heroes.routes.js";
import logsRoutes from "./logs.routes.js";
import recommendationRoutes from "./recommendations.routes.js";
import statsRoutes from "./stats.routes.js";
import usersRoutes from "./users.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "dota-pick-assistant-backend" });
});

router.get("/health/db", async (_req, res) => {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.json({
      status: "ok",
      service: "dota-pick-assistant-backend",
      database: {
        status: "ok",
        latencyMs: Date.now() - startedAt,
      },
    });
  } catch (error) {
    return res.status(503).json({
      status: "error",
      service: "dota-pick-assistant-backend",
      database: {
        status: "unavailable",
        latencyMs: Date.now() - startedAt,
        message: error instanceof Error ? error.message : "Unknown database error",
      },
    });
  }
});

router.use("/auth", authRoutes);
router.use("/heroes", heroesRoutes);
router.use("/recommendations", recommendationRoutes);
router.use("/users", usersRoutes);
router.use("/stats", statsRoutes);
router.use("/logs", logsRoutes);

export default router;
