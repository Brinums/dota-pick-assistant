import { prisma } from "../lib/prisma.js";

const DEFAULT_TOP_N = 5;

function toPositiveIntSet(ids) {
  return [...new Set(ids.filter((id) => Number.isInteger(id) && id > 0))];
}

function roleMatches(hero, desiredRole) {
  if (!desiredRole) {
    return true;
  }

  if (!hero || !Array.isArray(hero.roles)) {
    return false;
  }

  const normalizedRole = desiredRole.trim().toLowerCase();
  return hero.roles.some(
    (role) => typeof role === "string" && role.trim().toLowerCase() === normalizedRole,
  );
}

function estimateHeroScore({ hero, desiredRole }) {
  const proWinRate =
    Number(hero.proPick || 0) > 0
      ? (Number(hero.proWin || 0) / Number(hero.proPick || 1)) * 100
      : Number(hero.rawWinRate || 0);

  const roleBonus = roleMatches(hero, desiredRole) ? 5 : 0;
  const baseScore = Number(hero.rawWinRate || 0) * 0.7 + proWinRate * 0.3;
  const finalScore = baseScore + roleBonus;

  return {
    finalScore: Number(finalScore.toFixed(3)),
    proWinRate: Number(proWinRate.toFixed(2)),
  };
}

export async function buildRecommendations({
  userId,
  allyHeroIds,
  enemyHeroIds,
  excludedHeroIds = [],
  desiredRole,
  topN = DEFAULT_TOP_N,
}) {
  const allies = toPositiveIntSet(allyHeroIds);
  const enemies = toPositiveIntSet(enemyHeroIds);
  const excluded = toPositiveIntSet(excludedHeroIds);

  const forbidden = new Set([...allies, ...enemies, ...excluded]);
  const topLimit = Math.max(1, Math.min(Number(topN) || DEFAULT_TOP_N, 10));

  const candidatesRaw = await prisma.hero.findMany({
    where: {
      id: {
        notIn: [...forbidden],
      },
    },
    orderBy: { rawWinRate: "desc" },
  });

  const candidates = desiredRole
    ? candidatesRaw.filter((hero) => roleMatches(hero, desiredRole))
    : candidatesRaw;

  const ranked = candidates.map((hero) => {
    const score = estimateHeroScore({ hero, desiredRole });
    return {
      hero,
      ...score,
    };
  });

  ranked.sort((a, b) => b.finalScore - a.finalScore);
  const selected = ranked.slice(0, topLimit);

  const saved = await Promise.all(
    selected.map((item) =>
      prisma.recommendation.create({
        data: {
          userId,
          suggestedHeroId: item.hero.id,
          allyHeroIds: allies,
          enemyHeroIds: enemies,
          score: item.finalScore,
          reason: [
            `RawWR:${Number(item.hero.rawWinRate || 0).toFixed(2)}%`,
            `ProWR:${item.proWinRate.toFixed(2)}%`,
            desiredRole ? `Role:${desiredRole}` : "Role:Any",
            "Model v1",
          ].join(" | "),
        },
        include: {
          suggestedHero: {
            select: {
              id: true,
              localizedName: true,
              primaryAttr: true,
              attackType: true,
              roles: true,
              rawWinRate: true,
            },
          },
        },
      }),
    ),
  );

  return saved;
}
