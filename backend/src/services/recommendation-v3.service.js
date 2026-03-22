import { prisma } from "../lib/prisma.js";
import {
  fetchHeroMatchups,
  fetchMatchDetails,
  fetchRecentProMatches,
} from "./opendota.service.js";

const DEFAULT_TOP_N = 3;
const DEFAULT_MIN_MATCHUP_GAMES = 8;
const DEFAULT_MIN_SYNERGY_GAMES = 8;

function toPositiveIntSet(ids) {
  return [...new Set(ids.filter((id) => Number.isInteger(id) && id > 0))];
}

function parseMatchPicks(matchDetails) {
  if (!matchDetails || !Array.isArray(matchDetails.players)) {
    return null;
  }

  const radiant = [];
  const dire = [];

  for (const player of matchDetails.players) {
    const heroId = Number(player.hero_id);
    const slot = Number(player.player_slot);

    if (!Number.isInteger(heroId) || heroId <= 0 || !Number.isInteger(slot)) {
      continue;
    }

    if (slot < 128) {
      radiant.push(heroId);
    } else {
      dire.push(heroId);
    }
  }

  const radiantPicks = toPositiveIntSet(radiant);
  const direPicks = toPositiveIntSet(dire);

  if (radiantPicks.length !== 5 || direPicks.length !== 5) {
    return null;
  }

  return {
    radiantPicks,
    direPicks,
    winner: matchDetails.radiant_win ? "radiant" : "dire",
    playedAt: new Date(Number(matchDetails.start_time) * 1000),
  };
}

function weightedWinRate(records, winsField, gamesField) {
  const totals = records.reduce(
    (acc, record) => {
      const wins = Number(record[winsField] || 0);
      const games = Number(record[gamesField] || 0);

      if (games <= 0) {
        return acc;
      }

      acc.wins += wins;
      acc.games += games;
      return acc;
    },
    { wins: 0, games: 0 },
  );

  if (totals.games <= 0) {
    return null;
  }

  return {
    winRate: (totals.wins / totals.games) * 100,
    games: totals.games,
  };
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

function makePair(a, b) {
  return `${a}:${b}`;
}

function ensurePairStat(statsMap, a, b) {
  const key = makePair(a, b);
  if (!statsMap.has(key)) {
    statsMap.set(key, {
      heroId: a,
      withHeroId: b,
      winsTogether: 0,
      gamesTogether: 0,
    });
  }

  return statsMap.get(key);
}

function accumulateTeamSynergy(statsMap, heroIds, teamWon) {
  for (let i = 0; i < heroIds.length; i += 1) {
    for (let j = i + 1; j < heroIds.length; j += 1) {
      const a = heroIds[i];
      const b = heroIds[j];

      const forward = ensurePairStat(statsMap, a, b);
      const backward = ensurePairStat(statsMap, b, a);

      forward.gamesTogether += 1;
      backward.gamesTogether += 1;

      if (teamWon) {
        forward.winsTogether += 1;
        backward.winsTogether += 1;
      }
    }
  }
}

function computeFinalScore(counterWinRate, synergyWinRate, counterGames, synergyGames) {
  const counterWeight = counterGames > 0 ? 0.6 : 0.3;
  const synergyWeight = synergyGames > 0 ? 0.4 : 0.2;
  const baselineWeight = Math.max(0, 1 - counterWeight - synergyWeight);
  const baseline = 50;

  return (
    counterWinRate * counterWeight +
    synergyWinRate * synergyWeight +
    baseline * baselineWeight
  );
}

export async function syncHeroMatchupsMatrix({ minGamesPlayed = 1 } = {}) {
  const heroes = await prisma.hero.findMany({ select: { id: true } });

  let heroesProcessed = 0;
  let rowsUpserted = 0;

  for (const hero of heroes) {
    const heroId = Number(hero.id);

    let rows = [];
    try {
      rows = await fetchHeroMatchups(heroId);
    } catch {
      continue;
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      continue;
    }

    const upserts = rows
      .map((row) => {
        const vsHeroId = Number(row.hero_id);
        const wins = Number(row.wins || 0);
        const gamesPlayed = Number(row.games_played || 0);

        if (!Number.isInteger(vsHeroId) || vsHeroId <= 0 || vsHeroId === heroId) {
          return null;
        }

        if (!Number.isFinite(gamesPlayed) || gamesPlayed < minGamesPlayed) {
          return null;
        }

        const winRate = gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 50;

        rowsUpserted += 1;

        return prisma.heroMatchup.upsert({
          where: {
            heroId_vsHeroId: {
              heroId,
              vsHeroId,
            },
          },
          create: {
            heroId,
            vsHeroId,
            wins,
            gamesPlayed,
            winRate: Number(winRate.toFixed(4)),
          },
          update: {
            wins,
            gamesPlayed,
            winRate: Number(winRate.toFixed(4)),
          },
        });
      })
      .filter(Boolean);

    if (upserts.length > 0) {
      await prisma.$transaction(upserts);
    }

    heroesProcessed += 1;
  }

  return {
    heroesTotal: heroes.length,
    heroesProcessed,
    rowsUpserted,
  };
}

export async function syncRecentMatchesWithDraftData({ limit = 40 } = {}) {
  const normalizedLimit = Math.max(1, Math.min(Number(limit) || 40, 120));

  const recentMatches = await fetchRecentProMatches();
  const selected = Array.isArray(recentMatches)
    ? recentMatches.slice(0, normalizedLimit)
    : [];

  let synced = 0;
  let skipped = 0;

  for (const match of selected) {
    const matchId = Number(match.match_id);
    if (!Number.isFinite(matchId) || matchId <= 0) {
      skipped += 1;
      continue;
    }

    let details;
    try {
      details = await fetchMatchDetails(matchId);
    } catch {
      skipped += 1;
      continue;
    }

    const parsed = parseMatchPicks(details);
    if (!parsed) {
      skipped += 1;
      continue;
    }

    await prisma.match.upsert({
      where: { id: BigInt(matchId) },
      create: {
        id: BigInt(matchId),
        radiantPicks: parsed.radiantPicks,
        direPicks: parsed.direPicks,
        winner: parsed.winner,
        playedAt: parsed.playedAt,
        source: "OpenDotaDetailed",
      },
      update: {
        radiantPicks: parsed.radiantPicks,
        direPicks: parsed.direPicks,
        winner: parsed.winner,
        playedAt: parsed.playedAt,
        source: "OpenDotaDetailed",
      },
    });

    synced += 1;
  }

  return {
    requested: normalizedLimit,
    synced,
    skipped,
  };
}

export async function rebuildHeroSynergiesFromStoredMatches({ minGamesTogether = 1 } = {}) {
  const matches = await prisma.match.findMany({
    orderBy: { playedAt: "desc" },
    take: 1500,
    select: {
      radiantPicks: true,
      direPicks: true,
      winner: true,
    },
  });

  const statsMap = new Map();

  for (const match of matches) {
    const radiantPicks = Array.isArray(match.radiantPicks)
      ? toPositiveIntSet(match.radiantPicks.map((id) => Number(id)))
      : [];
    const direPicks = Array.isArray(match.direPicks)
      ? toPositiveIntSet(match.direPicks.map((id) => Number(id)))
      : [];

    if (radiantPicks.length < 2 || direPicks.length < 2) {
      continue;
    }

    const radiantWon = match.winner === "radiant";
    accumulateTeamSynergy(statsMap, radiantPicks, radiantWon);
    accumulateTeamSynergy(statsMap, direPicks, !radiantWon);
  }

  await prisma.heroSynergy.deleteMany({});

  const records = [...statsMap.values()].filter((row) => row.gamesTogether >= minGamesTogether);

  if (records.length > 0) {
    const writes = records.map((row) =>
      prisma.heroSynergy.create({
        data: {
          heroId: row.heroId,
          withHeroId: row.withHeroId,
          winsTogether: row.winsTogether,
          gamesTogether: row.gamesTogether,
          winRate: Number(((row.winsTogether / row.gamesTogether) * 100).toFixed(4)),
        },
      }),
    );

    await prisma.$transaction(writes);
  }

  return {
    matchesScanned: matches.length,
    pairsStored: records.length,
  };
}

export async function buildRecommendationsV3({
  userId,
  currentTeam,
  enemyTeam,
  desiredRole,
  topN = DEFAULT_TOP_N,
  excludedHeroIds = [],
  minMatchupGames = DEFAULT_MIN_MATCHUP_GAMES,
  minSynergyGames = DEFAULT_MIN_SYNERGY_GAMES,
}) {
  const allyHeroIds = toPositiveIntSet(currentTeam);
  const enemyHeroIds = toPositiveIntSet(enemyTeam);
  const excluded = toPositiveIntSet(excludedHeroIds);

  const forbidden = new Set([...allyHeroIds, ...enemyHeroIds, ...excluded]);

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

  const topLimit = Math.max(1, Math.min(Number(topN) || DEFAULT_TOP_N, 10));

  const ranked = [];

  for (const hero of candidates) {
    const [counterRows, synergyRows] = await Promise.all([
      prisma.heroMatchup.findMany({
        where: {
          heroId: hero.id,
          vsHeroId: { in: enemyHeroIds },
          gamesPlayed: { gte: minMatchupGames },
        },
      }),
      prisma.heroSynergy.findMany({
        where: {
          heroId: hero.id,
          withHeroId: { in: allyHeroIds },
          gamesTogether: { gte: minSynergyGames },
        },
      }),
    ]);

    const counterAgg = weightedWinRate(counterRows, "wins", "gamesPlayed");
    const synergyAgg = weightedWinRate(synergyRows, "winsTogether", "gamesTogether");

    const counterWinRate = counterAgg?.winRate ?? hero.rawWinRate;
    const synergyWinRate = synergyAgg?.winRate ?? hero.rawWinRate;
    const counterGames = counterAgg?.games ?? 0;
    const synergyGames = synergyAgg?.games ?? 0;

    const finalScore = computeFinalScore(
      counterWinRate,
      synergyWinRate,
      counterGames,
      synergyGames,
    );

    ranked.push({
      hero,
      finalScore,
      counterWinRate,
      synergyWinRate,
      counterGames,
      synergyGames,
    });
  }

  ranked.sort((a, b) => b.finalScore - a.finalScore);

  const selected = ranked.slice(0, topLimit);

  const saved = await Promise.all(
    selected.map((item) =>
      prisma.recommendation.create({
        data: {
          userId,
          suggestedHeroId: item.hero.id,
          allyHeroIds,
          enemyHeroIds,
          score: Number(item.finalScore.toFixed(3)),
          reason: [
            `CounterWR:${item.counterWinRate.toFixed(2)}%`,
            `SynergyWR:${item.synergyWinRate.toFixed(2)}%`,
            `CounterGames:${item.counterGames}`,
            `SynergyGames:${item.synergyGames}`,
            desiredRole ? `Role:${desiredRole}` : "Role:Any",
            "Model v3",
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

  return {
    data: saved,
    meta: {
      model: "v3",
      requestedTopN: topLimit,
      candidatesConsidered: candidates.length,
      roleFilterApplied: desiredRole || null,
      note:
        "Counter-winrate uses OpenDota hero matchups. Synergy-winrate uses locally aggregated match pair data.",
    },
  };
}
