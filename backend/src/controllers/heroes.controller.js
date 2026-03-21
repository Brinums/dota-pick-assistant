import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { fetchHeroStats, fetchRecentProMatches } from "../services/opendota.service.js";

const listHeroesSchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(500).default(30),
    offset: z.coerce.number().int().min(0).default(0),
    search: z.string().trim().min(1).max(120).optional(),
    primaryAttr: z.string().trim().min(1).max(30).optional(),
    attackType: z.enum(["Melee", "Ranged"]).optional(),
    role: z.string().trim().min(1).max(40).optional(),
    sortBy: z.enum(["localizedName", "rawWinRate", "proPick", "createdAt"]).default("localizedName"),
    order: z.enum(["asc", "desc"]).default("asc"),
  });

const heroCreateSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1).max(120),
  localizedName: z.string().trim().min(1).max(120),
  primaryAttr: z.string().trim().min(1).max(30),
  attackType: z.enum(["Melee", "Ranged"]),
  roles: z.array(z.string().trim().min(1).max(50)).min(1).max(10),
  proPick: z.number().int().min(0).default(0),
  proWin: z.number().int().min(0).default(0),
  rawWinRate: z.number().min(0).max(100).default(50),
});

const heroUpdateSchema = heroCreateSchema.partial().omit({ id: true }).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field must be provided for update",
  },
);

function buildHeroWhereClause(query) {
  const and = [];

  if (query.search) {
    and.push({
      OR: [
        {
          localizedName: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          name: {
            contains: query.search,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (query.primaryAttr) {
    and.push({
      primaryAttr: {
        equals: query.primaryAttr,
        mode: "insensitive",
      },
    });
  }

  if (query.attackType) {
    and.push({ attackType: query.attackType });
  }

  if (query.role) {
    and.push({
      roles: {
        array_contains: [query.role],
      },
    });
  }

  return and.length > 0 ? { AND: and } : {};
}

function normalizeAttackType(rawAttackType) {
  return rawAttackType === "Ranged" ? "Ranged" : "Melee";
}

function computeSmoothedWinRate(wins, games) {
  const safeWins = Number.isFinite(wins) ? Math.max(0, wins) : 0;
  const safeGames = Number.isFinite(games) ? Math.max(0, games) : 0;

  if (safeGames <= 0) {
    return 50;
  }

  const priorGames = 20;
  const priorWins = 10; // 50% prior
  const smoothed = ((safeWins + priorWins) / (safeGames + priorGames)) * 100;

  return Number(Math.min(99.9, Math.max(0.1, smoothed)).toFixed(2));
}

function extractOpenDotaGeneralTotals(hero) {
  const totals = { wins: 0, games: 0 };

  for (const [key, value] of Object.entries(hero)) {
    if (!/^[1-8]_pick$/.test(key)) {
      continue;
    }

    const pickCount = Number(value || 0);
    if (!Number.isFinite(pickCount) || pickCount <= 0) {
      continue;
    }

    const winKey = key.replace("_pick", "_win");
    const winCount = Number(hero[winKey] || 0);

    totals.games += Math.max(0, pickCount);
    totals.wins += Math.max(0, Math.min(pickCount, winCount));
  }

  return totals;
}

export async function listHeroes(req, res, next) {
  try {
    const query = listHeroesSchema.parse(req.query);
    const where = buildHeroWhereClause(query);

    const [heroes, total] = await Promise.all([
      prisma.hero.findMany({
        where,
        orderBy: { [query.sortBy]: query.order },
        take: query.limit,
        skip: query.offset,
      }),
      prisma.hero.count({ where }),
    ]);

    return res.json({
      data: heroes,
      pagination: {
        limit: query.limit,
        offset: query.offset,
        total,
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Invalid query params", errors: error.errors });
    }

    return next(error);
  }
}

export async function getHeroById(req, res, next) {
  try {
    const heroId = Number(req.params.id);
    if (!Number.isInteger(heroId) || heroId <= 0) {
      return res.status(400).json({ message: "Invalid hero id" });
    }

    const hero = await prisma.hero.findUnique({
      where: { id: heroId },
    });

    if (!hero) {
      return res.status(404).json({ message: "Hero not found" });
    }

    return res.json({ data: hero });
  } catch (error) {
    return next(error);
  }
}

export async function createHero(req, res, next) {
  try {
    const payload = heroCreateSchema.parse(req.body);

    if (payload.proWin > payload.proPick) {
      return res.status(400).json({ message: "proWin cannot be greater than proPick" });
    }

    const hero = await prisma.hero.create({
      data: {
        ...payload,
        roles: payload.roles,
      },
    });

    return res.status(201).json({
      message: "Hero created",
      data: hero,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }

    if (error.code === "P2002") {
      return res.status(409).json({ message: "Hero with this id or localized name already exists" });
    }

    return next(error);
  }
}

export async function updateHero(req, res, next) {
  try {
    const heroId = Number(req.params.id);
    if (!Number.isInteger(heroId) || heroId <= 0) {
      return res.status(400).json({ message: "Invalid hero id" });
    }

    const payload = heroUpdateSchema.parse(req.body);

    if (payload.proPick !== undefined && payload.proWin !== undefined && payload.proWin > payload.proPick) {
      return res.status(400).json({ message: "proWin cannot be greater than proPick" });
    }

    const existing = await prisma.hero.findUnique({
      where: { id: heroId },
      select: { proPick: true, proWin: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "Hero not found" });
    }

    const nextProPick = payload.proPick ?? existing.proPick;
    const nextProWin = payload.proWin ?? existing.proWin;
    if (nextProWin > nextProPick) {
      return res.status(400).json({ message: "proWin cannot be greater than proPick" });
    }

    const hero = await prisma.hero.update({
      where: { id: heroId },
      data: {
        ...payload,
        roles: payload.roles,
      },
    });

    return res.json({
      message: "Hero updated",
      data: hero,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Hero not found" });
    }

    if (error.code === "P2002") {
      return res.status(409).json({ message: "Hero with this localized name already exists" });
    }

    return next(error);
  }
}

export async function deleteHero(req, res, next) {
  try {
    const heroId = Number(req.params.id);
    if (!Number.isInteger(heroId) || heroId <= 0) {
      return res.status(400).json({ message: "Invalid hero id" });
    }

    await prisma.hero.delete({
      where: { id: heroId },
    });

    return res.json({ message: "Hero deleted" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Hero not found" });
    }

    if (error.code === "P2003") {
      return res.status(409).json({
        message: "Hero cannot be deleted because it is used in existing recommendations",
      });
    }

    return next(error);
  }
}

export async function syncHeroes(req, res, next) {
  try {
    const stats = await fetchHeroStats();
    if (!Array.isArray(stats)) {
      return res.status(502).json({ message: "Unexpected OpenDota response for hero stats" });
    }

    const operations = stats.map((hero) => {
      const proPick = Number(hero.pro_pick || 0);
      const proWin = Number(hero.pro_win || 0);
      const turboPicks = Number(hero.turbo_picks || 0);
      const turboWins = Number(hero.turbo_wins || 0);
      const generalTotals = extractOpenDotaGeneralTotals(hero);

      let winsForRate = generalTotals.wins;
      let gamesForRate = generalTotals.games;

      if (gamesForRate <= 0 && turboPicks > 0) {
        winsForRate = turboWins;
        gamesForRate = turboPicks;
      }

      if (gamesForRate <= 0 && proPick > 0) {
        winsForRate = proWin;
        gamesForRate = proPick;
      }

      const baseWinRate = computeSmoothedWinRate(winsForRate, gamesForRate);

      return prisma.hero.upsert({
        where: { id: hero.id },
        create: {
          id: hero.id,
          name: hero.name || `npc_dota_hero_${hero.id}`,
          localizedName: hero.localized_name || hero.name || `Hero ${hero.id}`,
          primaryAttr: hero.primary_attr || "unknown",
          attackType: normalizeAttackType(hero.attack_type),
          roles: hero.roles || [],
          proPick,
          proWin,
          rawWinRate: Number(baseWinRate.toFixed(2)),
        },
        update: {
          name: hero.name || `npc_dota_hero_${hero.id}`,
          localizedName: hero.localized_name || hero.name || `Hero ${hero.id}`,
          primaryAttr: hero.primary_attr || "unknown",
          attackType: normalizeAttackType(hero.attack_type),
          roles: hero.roles || [],
          proPick,
          proWin,
          rawWinRate: Number(baseWinRate.toFixed(2)),
        },
      });
    });

    await prisma.$transaction(operations);

    return res.json({
      message: "Heroes synced from OpenDota successfully",
      synced: stats.length,
    });
  } catch (error) {
    return next(error);
  }
}

export async function syncRecentMatches(req, res, next) {
  try {
    const matches = await fetchRecentProMatches();
    if (!Array.isArray(matches)) {
      return res.status(502).json({ message: "Unexpected OpenDota response for pro matches" });
    }

    const topMatches = matches.slice(0, 100);

    const operations = topMatches.map((match) =>
      prisma.match.upsert({
        where: { id: BigInt(match.match_id) },
        create: {
          id: BigInt(match.match_id),
          radiantPicks: [],
          direPicks: [],
          winner: match.radiant_win ? "radiant" : "dire",
          playedAt: new Date(Number(match.start_time) * 1000),
          source: "OpenDota",
        },
        update: {
          winner: match.radiant_win ? "radiant" : "dire",
          playedAt: new Date(Number(match.start_time) * 1000),
          source: "OpenDota",
        },
      }),
    );

    await prisma.$transaction(operations);

    return res.json({
      message: "Recent pro matches synced from OpenDota",
      synced: topMatches.length,
    });
  } catch (error) {
    return next(error);
  }
}
