import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import {
  buildAdaptiveRecommendations,
  refreshAdaptiveRecommendationLiveData,
  rebuildHeroSynergiesFromStoredMatches,
  syncHeroMatchupsMatrix,
  syncRecentMatchesWithDraftData,
} from "../services/recommendation-adaptive.service.js";
import { buildRecommendations } from "../services/recommendation.service.js";

const recommendationCreateSchema = z.object({
  allyHeroIds: z.array(z.number().int().positive()).min(1).max(5),
  enemyHeroIds: z.array(z.number().int().positive()).min(1).max(5),
  excludedHeroIds: z.array(z.number().int().positive()).max(30).optional().default([]),
  desiredRole: z.string().trim().min(3).max(30).optional(),
  topN: z.number().int().min(1).max(10).default(5),
});

const recommendationListSchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(30),
    offset: z.coerce.number().int().min(0).default(0),
    sortBy: z.enum(["createdAt", "updatedAt", "score", "heroName", "heroWinRate"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
    search: z.string().trim().min(1).max(160).optional(),
    minScore: z.coerce.number().min(0).max(200).optional(),
    maxScore: z.coerce.number().min(0).max(200).optional(),
    primaryAttr: z.string().trim().min(1).max(30).optional(),
    attackType: z.enum(["Melee", "Ranged"]).optional(),
    suggestedHeroId: z.coerce.number().int().positive().optional(),
    fromDate: z.coerce.date().optional(),
    toDate: z.coerce.date().optional(),
    userEmail: z.string().email().optional(),
    userId: z.coerce.number().int().positive().optional(),
  })
  .refine(
    (data) => data.minScore === undefined || data.maxScore === undefined || data.minScore <= data.maxScore,
    {
      message: "minScore must be less than or equal to maxScore",
      path: ["minScore"],
    },
  )
  .refine(
    (data) => data.fromDate === undefined || data.toDate === undefined || data.fromDate <= data.toDate,
    {
      message: "fromDate must be less than or equal to toDate",
      path: ["fromDate"],
    },
  );

const recommendationUpdateSchema = z
  .object({
    suggestedHeroId: z.number().int().positive().optional(),
    allyHeroIds: z.array(z.number().int().positive()).min(1).max(5).optional(),
    enemyHeroIds: z.array(z.number().int().positive()).min(1).max(5).optional(),
    score: z.number().min(0).max(200).optional(),
    reason: z.string().trim().min(5).max(500).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

const recommendationCreateAdaptiveSchema = z
  .object({
    currentTeam: z.array(z.number().int().positive()).min(1).max(5),
    enemyTeam: z.array(z.number().int().positive()).min(1).max(5),
    excludedHeroIds: z.array(z.number().int().positive()).max(30).optional().default([]),
    desiredRole: z.string().trim().min(3).max(30).optional(),
    topN: z.number().int().min(1).max(10).default(3),
    minMatchupGames: z.number().int().min(1).max(2000).default(8),
    minSynergyGames: z.number().int().min(1).max(2000).default(8),
    autoRefreshRecentMatches: z.boolean().default(false),
    recentMatchesLimit: z.number().int().min(1).max(10).default(5),
  })
  .refine((data) => new Set(data.currentTeam).size === data.currentTeam.length, {
    message: "currentTeam contains duplicate hero ids",
    path: ["currentTeam"],
  })
  .refine((data) => new Set(data.enemyTeam).size === data.enemyTeam.length, {
    message: "enemyTeam contains duplicate hero ids",
    path: ["enemyTeam"],
  })
  .refine(
    (data) => {
      const currentSet = new Set(data.currentTeam);
      return data.enemyTeam.every((heroId) => !currentSet.has(heroId));
    },
    {
      message: "currentTeam and enemyTeam cannot contain the same hero id",
      path: ["enemyTeam"],
    },
  );

const recommendationSyncSchema = z.object({
  minMatchupGamesPlayed: z.number().int().min(1).max(2000).default(1),
  matchLimit: z.number().int().min(1).max(120).default(40),
  minSynergyGamesTogether: z.number().int().min(1).max(2000).default(1),
});

const recommendationSyncCancelSchema = z
  .object({
    force: z.boolean().optional().default(false),
  })
  .optional()
  .default({});

const recommendationSyncJobState = {
  status: "idle", // idle | running | completed | failed | cancelled
  cancelRequested: false,
  startedAt: null,
  finishedAt: null,
  progress: 0,
  currentStep: null,
  payload: null,
  result: null,
  error: null,
};

function getRecommendationSyncStatusResponse() {
  return {
    status: recommendationSyncJobState.status,
    cancelRequested: recommendationSyncJobState.cancelRequested,
    startedAt: recommendationSyncJobState.startedAt,
    finishedAt: recommendationSyncJobState.finishedAt,
    progress: recommendationSyncJobState.progress,
    currentStep: recommendationSyncJobState.currentStep,
    payload: recommendationSyncJobState.payload,
    result: recommendationSyncJobState.result,
    error: recommendationSyncJobState.error,
  };
}

function resetRecommendationSyncJobState() {
  recommendationSyncJobState.status = "idle";
  recommendationSyncJobState.cancelRequested = false;
  recommendationSyncJobState.startedAt = null;
  recommendationSyncJobState.finishedAt = null;
  recommendationSyncJobState.progress = 0;
  recommendationSyncJobState.currentStep = null;
  recommendationSyncJobState.payload = null;
  recommendationSyncJobState.result = null;
  recommendationSyncJobState.error = null;
}

function markRecommendationSyncCancelled() {
  recommendationSyncJobState.status = "cancelled";
  recommendationSyncJobState.finishedAt = new Date().toISOString();
  recommendationSyncJobState.currentStep = "cancelled";
}

async function runRecommendationSyncJob(payload) {
  recommendationSyncJobState.status = "running";
  recommendationSyncJobState.cancelRequested = false;
  recommendationSyncJobState.startedAt = new Date().toISOString();
  recommendationSyncJobState.finishedAt = null;
  recommendationSyncJobState.progress = 0;
  recommendationSyncJobState.currentStep = "matchups";
  recommendationSyncJobState.payload = payload;
  recommendationSyncJobState.result = null;
  recommendationSyncJobState.error = null;

  try {
    if (recommendationSyncJobState.cancelRequested) {
      markRecommendationSyncCancelled();
      return;
    }

    const matchups = await syncHeroMatchupsMatrix({
      minGamesPlayed: payload.minMatchupGamesPlayed,
    });
    recommendationSyncJobState.progress = 34;
    recommendationSyncJobState.currentStep = "matches";

    if (recommendationSyncJobState.cancelRequested) {
      recommendationSyncJobState.result = { matchups };
      markRecommendationSyncCancelled();
      return;
    }

    const matches = await syncRecentMatchesWithDraftData({
      limit: payload.matchLimit,
    });
    recommendationSyncJobState.progress = 67;
    recommendationSyncJobState.currentStep = "synergies";

    if (recommendationSyncJobState.cancelRequested) {
      recommendationSyncJobState.result = { matchups, matches };
      markRecommendationSyncCancelled();
      return;
    }

    const synergies = await rebuildHeroSynergiesFromStoredMatches({
      minGamesTogether: payload.minSynergyGamesTogether,
    });

    recommendationSyncJobState.status = "completed";
    recommendationSyncJobState.progress = 100;
    recommendationSyncJobState.currentStep = "done";
    recommendationSyncJobState.finishedAt = new Date().toISOString();
    recommendationSyncJobState.result = {
      matchups,
      matches,
      synergies,
    };
  } catch (error) {
    recommendationSyncJobState.status = "failed";
    recommendationSyncJobState.finishedAt = new Date().toISOString();
    recommendationSyncJobState.currentStep = "failed";
    recommendationSyncJobState.error = error?.message || "Unknown sync error";
  }
}

function buildRecommendationWhere(query, scope = "own", userContext = null) {
  const and = [];

  if (scope === "own") {
    and.push({ userId: userContext.userId });
  }

  if (scope === "admin" && query.userId) {
    and.push({ userId: query.userId });
  }

  if (scope === "admin" && query.userEmail) {
    and.push({
      user: {
        is: {
          email: {
            equals: query.userEmail.toLowerCase(),
          },
        },
      },
    });
  }

  if (query.search) {
    and.push({
      OR: [
        {
          reason: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          suggestedHero: {
            is: {
              localizedName: {
                contains: query.search,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    });
  }

  if (query.minScore !== undefined || query.maxScore !== undefined) {
    and.push({
      score: {
        gte: query.minScore,
        lte: query.maxScore,
      },
    });
  }

  if (query.suggestedHeroId !== undefined) {
    and.push({ suggestedHeroId: query.suggestedHeroId });
  }

  if (query.fromDate || query.toDate) {
    and.push({
      createdAt: {
        gte: query.fromDate,
        lte: query.toDate,
      },
    });
  }

  if (query.primaryAttr || query.attackType) {
    and.push({
      suggestedHero: {
        is: {
          ...(query.primaryAttr
            ? {
                primaryAttr: {
                  equals: query.primaryAttr,
                  mode: "insensitive",
                },
              }
            : {}),
          ...(query.attackType ? { attackType: query.attackType } : {}),
        },
      },
    });
  }

  return and.length > 0 ? { AND: and } : {};
}

function getRecommendationOrderBy(sortBy, order) {
  if (sortBy === "heroName") {
    return { suggestedHero: { localizedName: order } };
  }

  if (sortBy === "heroWinRate") {
    return { suggestedHero: { rawWinRate: order } };
  }

  return { [sortBy]: order };
}

function includeJoinedData() {
  return {
    suggestedHero: {
      select: {
        id: true,
        name: true,
        localizedName: true,
        primaryAttr: true,
        attackType: true,
        rawWinRate: true,
      },
    },
    user: {
      select: {
        id: true,
        email: true,
        role: true,
      },
    },
  };
}

export async function createRecommendations(req, res, next) {
  try {
    const payload = recommendationCreateSchema.parse(req.body);

    const allIds = [
      ...new Set([...payload.allyHeroIds, ...payload.enemyHeroIds, ...payload.excludedHeroIds]),
    ];
    const existingCount = await prisma.hero.count({ where: { id: { in: allIds } } });
    if (existingCount !== allIds.length) {
      return res.status(400).json({
        message: "Some hero ids are missing in local database. Run POST /api/heroes/sync first.",
      });
    }

    const recommendations = await buildRecommendations({
      userId: req.user.userId,
      allyHeroIds: payload.allyHeroIds,
      enemyHeroIds: payload.enemyHeroIds,
      excludedHeroIds: payload.excludedHeroIds,
      desiredRole: payload.desiredRole,
      topN: payload.topN,
    });

    return res.status(201).json({
      message: "Recommendations created",
      data: recommendations,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }

    return next(error);
  }
}

export async function createRecommendationsAdaptive(req, res, next) {
  try {
    const payload = recommendationCreateAdaptiveSchema.parse(req.body);

    const allIds = [
      ...new Set([...payload.currentTeam, ...payload.enemyTeam, ...payload.excludedHeroIds]),
    ];
    const existingCount = await prisma.hero.count({ where: { id: { in: allIds } } });

    if (existingCount !== allIds.length) {
      return res.status(400).json({
        message: "Some hero ids are missing in local database. Run POST /api/heroes/sync first.",
      });
    }

    const allowLiveRefresh = payload.autoRefreshRecentMatches && req.user?.role === "ADMIN";

    const liveRefresh = allowLiveRefresh
      ? await refreshAdaptiveRecommendationLiveData({
          matchLimit: payload.recentMatchesLimit,
          minSynergyGamesTogether: payload.minSynergyGames,
          focusHeroIds: [...payload.currentTeam, ...payload.enemyTeam],
          enemyHeroIds: payload.enemyTeam,
          minMatchupGamesPlayed: payload.minMatchupGames,
        })
      : {
          attempted: false,
          refreshed: false,
          source: "database",
          reason:
            payload.autoRefreshRecentMatches && req.user?.role !== "ADMIN"
              ? "disabled_for_non_admin"
              : "disabled_by_request",
        };

    const result = await buildAdaptiveRecommendations({
      userId: req.user.userId,
      currentTeam: payload.currentTeam,
      enemyTeam: payload.enemyTeam,
      desiredRole: payload.desiredRole,
      topN: payload.topN,
      excludedHeroIds: payload.excludedHeroIds,
      minMatchupGames: payload.minMatchupGames,
      minSynergyGames: payload.minSynergyGames,
    });

    return res.status(201).json({
      message: "Recommendations created (Adaptive Draft)",
      data: result.data,
      meta: {
        ...result.meta,
        liveRefresh,
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }

    return next(error);
  }
}

export async function syncRecommendationData(req, res, next) {
  try {
    const payload = recommendationSyncSchema.parse(req.body ?? {});

    const [matchups, matches] = await Promise.all([
      syncHeroMatchupsMatrix({
        minGamesPlayed: payload.minMatchupGamesPlayed,
      }),
      syncRecentMatchesWithDraftData({
        limit: payload.matchLimit,
      }),
    ]);
    const synergies = await rebuildHeroSynergiesFromStoredMatches({
      minGamesTogether: payload.minSynergyGamesTogether,
    });

    return res.json({
      message: "Recommendation data synced",
      data: {
        matchups,
        matches,
        synergies,
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }

    return next(error);
  }
}

export async function startRecommendationSyncJob(req, res, next) {
  try {
    const payload = recommendationSyncSchema.parse(req.body ?? {});

    if (recommendationSyncJobState.status === "running") {
      return res.status(409).json({
        message: "Recommendation sync is already running",
        data: getRecommendationSyncStatusResponse(),
      });
    }

    if (
      recommendationSyncJobState.status === "completed" ||
      recommendationSyncJobState.status === "failed" ||
      recommendationSyncJobState.status === "cancelled"
    ) {
      resetRecommendationSyncJobState();
    }

    runRecommendationSyncJob(payload);

    return res.status(202).json({
      message: "Recommendation sync started",
      data: getRecommendationSyncStatusResponse(),
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }

    return next(error);
  }
}

export async function getRecommendationSyncJobStatus(_req, res) {
  return res.json({
    data: getRecommendationSyncStatusResponse(),
  });
}

export async function cancelRecommendationSyncJob(req, res, next) {
  try {
    const payload = recommendationSyncCancelSchema.parse(req.body ?? {});

    if (recommendationSyncJobState.status !== "running") {
      return res.status(409).json({
        message: "Recommendation sync is not running",
        data: getRecommendationSyncStatusResponse(),
      });
    }

    recommendationSyncJobState.cancelRequested = true;
    recommendationSyncJobState.currentStep = payload.force ? "force-cancel-requested" : "cancel-requested";

    return res.json({
      message: "Cancellation requested",
      data: getRecommendationSyncStatusResponse(),
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }

    return next(error);
  }
}

export async function getMyRecommendations(req, res, next) {
  try {
    const query = recommendationListSchema.parse(req.query);
    const where = buildRecommendationWhere(query, "own", req.user);

    const [data, total] = await Promise.all([
      prisma.recommendation.findMany({
        where,
        orderBy: getRecommendationOrderBy(query.sortBy, query.order),
        take: query.limit,
        skip: query.offset,
        include: includeJoinedData(),
      }),
      prisma.recommendation.count({ where }),
    ]);

    return res.json({
      data,
      pagination: {
        limit: query.limit,
        offset: query.offset,
        total,
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }

    return next(error);
  }
}

export async function getAllRecommendationsAdmin(req, res, next) {
  try {
    const query = recommendationListSchema.parse(req.query);
    const where = buildRecommendationWhere(query, "admin");

    const [data, total] = await Promise.all([
      prisma.recommendation.findMany({
        where,
        orderBy: getRecommendationOrderBy(query.sortBy, query.order),
        take: query.limit,
        skip: query.offset,
        include: includeJoinedData(),
      }),
      prisma.recommendation.count({ where }),
    ]);

    return res.json({
      data,
      pagination: {
        limit: query.limit,
        offset: query.offset,
        total,
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }

    return next(error);
  }
}

export async function getRecommendationById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid recommendation id" });
    }

    const recommendation = await prisma.recommendation.findUnique({
      where: { id },
      include: includeJoinedData(),
    });

    if (!recommendation) {
      return res.status(404).json({ message: "Recommendation not found" });
    }

    if (req.user.role !== "ADMIN" && recommendation.userId !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden: not your recommendation" });
    }

    return res.json({ data: recommendation });
  } catch (error) {
    return next(error);
  }
}

export async function updateRecommendation(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid recommendation id" });
    }

    const payload = recommendationUpdateSchema.parse(req.body);

    const existing = await prisma.recommendation.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "Recommendation not found" });
    }

    if (req.user.role !== "ADMIN" && existing.userId !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden: not your recommendation" });
    }

    if (payload.suggestedHeroId !== undefined) {
      const hero = await prisma.hero.findUnique({
        where: { id: payload.suggestedHeroId },
        select: { id: true },
      });
      if (!hero) {
        return res.status(400).json({ message: "suggestedHeroId does not exist" });
      }
    }

    const updated = await prisma.recommendation.update({
      where: { id },
      data: payload,
      include: includeJoinedData(),
    });

    return res.json({
      message: "Recommendation updated",
      data: updated,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }

    return next(error);
  }
}

export async function deleteRecommendation(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid recommendation id" });
    }

    const existing = await prisma.recommendation.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "Recommendation not found" });
    }

    if (req.user.role !== "ADMIN" && existing.userId !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden: not your recommendation" });
    }

    await prisma.recommendation.delete({ where: { id } });

    return res.json({ message: "Recommendation deleted" });
  } catch (error) {
    return next(error);
  }
}
