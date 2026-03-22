import { prisma } from "../lib/prisma.js";
import {
  fetchHeroMatchups,
  fetchHeroMatches,
  fetchMatchDetails,
  fetchRecentProMatches,
  isOpenDotaQuotaError,
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

function matchContainsAnyHero(parsedMatch, heroIdSet) {
  if (!parsedMatch || !(heroIdSet instanceof Set)) {
    return false;
  }

  return [...parsedMatch.radiantPicks, ...parsedMatch.direPicks].some((heroId) =>
    heroIdSet.has(Number(heroId)),
  );
}

function weightedWinRateFromTotals(wins, games) {
  const normalizedWins = Number(wins || 0);
  const normalizedGames = Number(games || 0);

  if (normalizedGames <= 0) {
    return null;
  }

  const priorGames = 12;
  const priorWins = 6; // 50% prior
  const smoothedWinRate = ((normalizedWins + priorWins) / (normalizedGames + priorGames)) * 100;

  return {
    winRate: smoothedWinRate,
    games: normalizedGames,
  };
}

function aggregateByHeroId(rows, { heroIdField, winsField, gamesField }) {
  const grouped = new Map();

  for (const row of rows) {
    const heroId = Number(row?.[heroIdField]);
    const wins = Number(row?.[winsField] || 0);
    const games = Number(row?.[gamesField] || 0);

    if (!Number.isInteger(heroId) || heroId <= 0 || !Number.isFinite(games) || games <= 0) {
      continue;
    }

    const previous = grouped.get(heroId) || { wins: 0, games: 0 };
    grouped.set(heroId, {
      wins: previous.wins + wins,
      games: previous.games + games,
    });
  }

  return grouped;
}

function normalizedWinRate(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 50;
  }

  if (numeric <= 0) {
    return 50;
  }

  return Math.min(99.9, Math.max(0.1, numeric));
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

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function computeConfidence(counterWinRate, synergyWinRate, counterGames, synergyGames) {
  const counterCoverage = clamp01((Number(counterGames) || 0) / 120);
  const synergyCoverage = clamp01((Number(synergyGames) || 0) / 100);
  const agreement = clamp01(1 - Math.abs(counterWinRate - synergyWinRate) / 50);

  const value = counterCoverage * 0.45 + synergyCoverage * 0.35 + agreement * 0.2;
  const percent = Number((value * 100).toFixed(2));

  let label = "Low";
  if (percent >= 75) {
    label = "High";
  } else if (percent >= 50) {
    label = "Medium";
  }

  return {
    score: percent,
    label,
    factors: {
      counterCoverage: Number((counterCoverage * 100).toFixed(2)),
      synergyCoverage: Number((synergyCoverage * 100).toFixed(2)),
      agreement: Number((agreement * 100).toFixed(2)),
    },
  };
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
  let recentMatches = [];
  try {
    recentMatches = await fetchRecentProMatches();
  } catch (error) {
    if (isOpenDotaQuotaError(error)) {
      return {
        requested: normalizedLimit,
        synced: 0,
        skipped: 0,
        quotaExceeded: true,
        haltedReason: error.message,
      };
    }

    throw error;
  }
  const selected = Array.isArray(recentMatches)
    ? recentMatches.slice(0, normalizedLimit)
    : [];

  let synced = 0;
  let skipped = 0;
  let quotaExceeded = false;
  let haltedReason = null;

  for (const match of selected) {
    const matchId = Number(match.match_id);
    if (!Number.isFinite(matchId) || matchId <= 0) {
      skipped += 1;
      continue;
    }

    let details;
    try {
      details = await fetchMatchDetails(matchId);
    } catch (error) {
      if (isOpenDotaQuotaError(error)) {
        quotaExceeded = true;
        haltedReason = error.message;
        break;
      }

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
    quotaExceeded,
    haltedReason,
  };
}

export async function syncMatchesForFocusHeroes({ focusHeroIds = [], limit = 20 } = {}) {
  const normalizedLimit = Math.max(1, Math.min(Number(limit) || 20, 40));
  const sourceHeroes = toPositiveIntSet(focusHeroIds).slice(0, 6);

  if (sourceHeroes.length === 0) {
    return {
      requested: normalizedLimit,
      synced: 0,
      skipped: 0,
      quotaExceeded: false,
      haltedReason: "No focus heroes provided",
    };
  }

  const focusSet = new Set(sourceHeroes);
  const matchIds = new Set();
  let quotaExceeded = false;
  let haltedReason = null;

  for (const heroId of sourceHeroes) {
    let heroMatches = [];
    try {
      heroMatches = await fetchHeroMatches(heroId);
    } catch (error) {
      if (isOpenDotaQuotaError(error)) {
        quotaExceeded = true;
        haltedReason = error.message;
        break;
      }

      continue;
    }

    if (!Array.isArray(heroMatches)) {
      continue;
    }

    for (const item of heroMatches) {
      const matchId = Number(item?.match_id);
      if (!Number.isFinite(matchId) || matchId <= 0) {
        continue;
      }
      matchIds.add(matchId);
      if (matchIds.size >= normalizedLimit * 4) {
        break;
      }
    }

    if (matchIds.size >= normalizedLimit * 4) {
      break;
    }
  }

  if (quotaExceeded) {
    return {
      requested: normalizedLimit,
      synced: 0,
      skipped: 0,
      quotaExceeded,
      haltedReason,
    };
  }

  const orderedMatchIds = [...matchIds].slice(0, normalizedLimit * 4);

  let synced = 0;
  let skipped = 0;

  for (const matchId of orderedMatchIds) {
    if (synced >= normalizedLimit) {
      break;
    }

    let details;
    try {
      details = await fetchMatchDetails(matchId);
    } catch (error) {
      if (isOpenDotaQuotaError(error)) {
        quotaExceeded = true;
        haltedReason = error.message;
        break;
      }

      skipped += 1;
      continue;
    }

    const parsed = parseMatchPicks(details);
    if (!parsed) {
      skipped += 1;
      continue;
    }

    if (!matchContainsAnyHero(parsed, focusSet)) {
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
        source: "OpenDotaFocused",
      },
      update: {
        radiantPicks: parsed.radiantPicks,
        direPicks: parsed.direPicks,
        winner: parsed.winner,
        playedAt: parsed.playedAt,
        source: "OpenDotaFocused",
      },
    });

    synced += 1;
  }

  return {
    requested: normalizedLimit,
    synced,
    skipped,
    quotaExceeded,
    haltedReason,
    focusHeroesUsed: sourceHeroes.length,
  };
}

export async function refreshAdaptiveRecommendationLiveData({
  matchLimit = 20,
  minSynergyGamesTogether = 1,
  focusHeroIds = [],
} = {}) {
  const normalizedLimit = Math.max(1, Math.min(Number(matchLimit) || 20, 20));

  try {
    const focusHeroes = toPositiveIntSet(focusHeroIds);
    const matches =
      focusHeroes.length > 0
        ? await syncMatchesForFocusHeroes({
            focusHeroIds: focusHeroes,
            limit: normalizedLimit,
          })
        : await syncRecentMatchesWithDraftData({ limit: normalizedLimit });

    if (matches.quotaExceeded) {
      return {
        attempted: true,
        refreshed: false,
        source: "database",
        reason: "quota_exceeded",
        details: matches.haltedReason || "Quota limit reached",
        matches,
      };
    }

    if (matches.synced <= 0) {
      return {
        attempted: true,
        refreshed: false,
        source: "database",
        reason: "no_new_matches",
        matches,
      };
    }

    const synergies = await rebuildHeroSynergiesFromStoredMatches({
      minGamesTogether: minSynergyGamesTogether,
    });

    return {
      attempted: true,
      refreshed: true,
      source: "live_plus_database",
      reason: "ok",
      matches,
      synergies,
      strategy: focusHeroes.length > 0 ? "focused_by_selected_heroes" : "latest_pro_matches",
    };
  } catch (error) {
    if (isOpenDotaQuotaError(error)) {
      return {
        attempted: true,
        refreshed: false,
        source: "database",
        reason: "quota_exceeded",
        details: error.message,
      };
    }

    return {
      attempted: true,
      refreshed: false,
      source: "database",
      reason: "sync_error",
      details: error.message,
    };
  }
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

export async function buildAdaptiveRecommendations({
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
  const candidateIds = candidates.map((hero) => hero.id);

  const [counterRowsRaw, synergyRowsRaw] = await Promise.all([
    candidateIds.length
      ? prisma.heroMatchup.findMany({
          where: {
            heroId: { in: candidateIds },
            vsHeroId: { in: enemyHeroIds },
            gamesPlayed: { gte: minMatchupGames },
          },
          select: {
            heroId: true,
            wins: true,
            gamesPlayed: true,
          },
        })
      : [],
    candidateIds.length
      ? prisma.heroSynergy.findMany({
          where: {
            heroId: { in: candidateIds },
            withHeroId: { in: allyHeroIds },
            gamesTogether: { gte: minSynergyGames },
          },
          select: {
            heroId: true,
            winsTogether: true,
            gamesTogether: true,
          },
        })
      : [],
  ]);

  const countersByHeroId = aggregateByHeroId(counterRowsRaw, {
    heroIdField: "heroId",
    winsField: "wins",
    gamesField: "gamesPlayed",
  });
  const synergiesByHeroId = aggregateByHeroId(synergyRowsRaw, {
    heroIdField: "heroId",
    winsField: "winsTogether",
    gamesField: "gamesTogether",
  });

  const ranked = candidates.map((hero) => {
    const counterTotals = countersByHeroId.get(hero.id);
    const synergyTotals = synergiesByHeroId.get(hero.id);
    const counterAgg = weightedWinRateFromTotals(counterTotals?.wins, counterTotals?.games);
    const synergyAgg = weightedWinRateFromTotals(synergyTotals?.wins, synergyTotals?.games);

    const heroBaseline = normalizedWinRate(hero.rawWinRate);
    const counterWinRate = counterAgg?.winRate ?? heroBaseline;
    const synergyWinRate = synergyAgg?.winRate ?? heroBaseline;
    const counterGames = counterAgg?.games ?? 0;
    const synergyGames = synergyAgg?.games ?? 0;

    const finalScore = computeFinalScore(
      counterWinRate,
      synergyWinRate,
      counterGames,
      synergyGames,
    );
    const confidence = computeConfidence(
      counterWinRate,
      synergyWinRate,
      counterGames,
      synergyGames,
    );

    return {
      hero,
      finalScore,
      counterWinRate,
      synergyWinRate,
      counterGames,
      synergyGames,
      confidence,
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
          allyHeroIds,
          enemyHeroIds,
          score: Number(item.finalScore.toFixed(3)),
          reason: [
            `CounterWR:${item.counterWinRate.toFixed(2)}%`,
            `SynergyWR:${item.synergyWinRate.toFixed(2)}%`,
            `CounterGames:${item.counterGames}`,
            `SynergyGames:${item.synergyGames}`,
            desiredRole ? `Role:${desiredRole}` : "Role:Any",
            "Model:AdaptiveDraft",
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

  const selectedByHeroId = new Map(selected.map((item) => [item.hero.id, item]));
  const enriched = saved.map((row) => {
    const source = selectedByHeroId.get(row.suggestedHeroId);

    return {
      ...row,
      confidence: source?.confidence || {
        score: 0,
        label: "Low",
        factors: {
          counterCoverage: 0,
          synergyCoverage: 0,
          agreement: 0,
        },
      },
      modelMetrics: {
        counterWinRate: Number((source?.counterWinRate || 0).toFixed(2)),
        synergyWinRate: Number((source?.synergyWinRate || 0).toFixed(2)),
        counterGames: source?.counterGames || 0,
        synergyGames: source?.synergyGames || 0,
      },
    };
  });

  return {
    data: enriched,
    meta: {
      model: "adaptive_draft",
      requestedTopN: topLimit,
      candidatesConsidered: candidates.length,
      roleFilterApplied: desiredRole || null,
      note:
        "Counter-winrate uses OpenDota hero matchups. Synergy-winrate uses locally aggregated match pair data. Confidence is based on games coverage and metric agreement.",
    },
  };
}
