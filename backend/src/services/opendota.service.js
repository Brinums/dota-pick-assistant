import axios from "axios";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

const OPENDOTA_PROVIDER = "OpenDota";

const opendotaClient = axios.create({
  baseURL: env.openDotaBaseUrl,
  timeout: 15_000,
});

export class OpenDotaQuotaError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "OpenDotaQuotaError";
    this.details = details;
  }
}

export function isOpenDotaQuotaError(error) {
  return error instanceof OpenDotaQuotaError || error?.name === "OpenDotaQuotaError";
}

function getCurrentDayStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

export async function getOpenDotaQuotaStatus() {
  const minuteStart = new Date(Date.now() - 60_000);
  const dayStart = getCurrentDayStart();

  const [minuteCalls, dayCalls] = await Promise.all([
    prisma.apiUsageLog.count({
      where: {
        provider: OPENDOTA_PROVIDER,
        requestedAt: {
          gte: minuteStart,
        },
      },
    }),
    prisma.apiUsageLog.count({
      where: {
        provider: OPENDOTA_PROVIDER,
        requestedAt: {
          gte: dayStart,
        },
      },
    }),
  ]);

  return {
    minuteLimit: env.openDotaMinuteLimit,
    dayLimit: env.openDotaDayLimit,
    minuteUsed: minuteCalls,
    dayUsed: dayCalls,
    minuteRemaining: Math.max(0, env.openDotaMinuteLimit - minuteCalls),
    dayRemaining: Math.max(0, env.openDotaDayLimit - dayCalls),
  };
}

async function assertOpenDotaQuotaAvailable() {
  const status = await getOpenDotaQuotaStatus();

  if (status.minuteRemaining <= 0) {
    throw new OpenDotaQuotaError("OpenDota minute quota exceeded", status);
  }

  if (status.dayRemaining <= 0) {
    throw new OpenDotaQuotaError("OpenDota daily quota exceeded", status);
  }
}

async function logApiUsage({ endpoint, method, statusCode, durationMs, success, payload }) {
  await prisma.apiUsageLog.create({
    data: {
      provider: OPENDOTA_PROVIDER,
      endpoint,
      method,
      statusCode,
      durationMs,
      success,
      payload,
    },
  });
}

export async function fetchHeroStats() {
  const endpoint = "/heroStats";
  const method = "GET";
  const startedAt = Date.now();

  try {
    await assertOpenDotaQuotaAvailable();
    const response = await opendotaClient.get(endpoint);
    const durationMs = Date.now() - startedAt;

    await logApiUsage({
      endpoint,
      method,
      statusCode: response.status,
      durationMs,
      success: true,
      payload: { records: Array.isArray(response.data) ? response.data.length : 0 },
    });

    return response.data;
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const statusCode = error.response?.status || 500;

    await logApiUsage({
      endpoint,
      method,
      statusCode,
      durationMs,
      success: false,
      payload: { message: error.message },
    });

    if (statusCode === 429) {
      throw new OpenDotaQuotaError("OpenDota responded with 429 (rate limit)", {
        statusCode,
      });
    }

    throw error;
  }
}

export async function fetchRecentProMatches() {
  const endpoint = "/proMatches";
  const method = "GET";
  const startedAt = Date.now();

  try {
    await assertOpenDotaQuotaAvailable();
    const response = await opendotaClient.get(endpoint);
    const durationMs = Date.now() - startedAt;

    await logApiUsage({
      endpoint,
      method,
      statusCode: response.status,
      durationMs,
      success: true,
      payload: { records: Array.isArray(response.data) ? response.data.length : 0 },
    });

    return response.data;
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const statusCode = error.response?.status || 500;

    await logApiUsage({
      endpoint,
      method,
      statusCode,
      durationMs,
      success: false,
      payload: { message: error.message },
    });

    if (statusCode === 429) {
      throw new OpenDotaQuotaError("OpenDota responded with 429 (rate limit)", {
        statusCode,
      });
    }

    throw error;
  }
}

export async function fetchHeroMatchups(heroId) {
  const endpoint = `/heroes/${heroId}/matchups`;
  const method = "GET";
  const startedAt = Date.now();

  try {
    await assertOpenDotaQuotaAvailable();
    const response = await opendotaClient.get(endpoint);
    const durationMs = Date.now() - startedAt;

    await logApiUsage({
      endpoint,
      method,
      statusCode: response.status,
      durationMs,
      success: true,
      payload: { records: Array.isArray(response.data) ? response.data.length : 0 },
    });

    return response.data;
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const statusCode = error.response?.status || 500;

    await logApiUsage({
      endpoint,
      method,
      statusCode,
      durationMs,
      success: false,
      payload: { message: error.message, heroId },
    });

    if (statusCode === 429) {
      throw new OpenDotaQuotaError("OpenDota responded with 429 (rate limit)", {
        statusCode,
      });
    }

    throw error;
  }
}

export async function fetchHeroMatches(heroId) {
  const endpoint = `/heroes/${heroId}/matches`;
  const method = "GET";
  const startedAt = Date.now();

  try {
    await assertOpenDotaQuotaAvailable();
    const response = await opendotaClient.get(endpoint);
    const durationMs = Date.now() - startedAt;

    await logApiUsage({
      endpoint,
      method,
      statusCode: response.status,
      durationMs,
      success: true,
      payload: { records: Array.isArray(response.data) ? response.data.length : 0 },
    });

    return response.data;
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const statusCode = error.response?.status || 500;

    await logApiUsage({
      endpoint,
      method,
      statusCode,
      durationMs,
      success: false,
      payload: { message: error.message, heroId },
    });

    if (statusCode === 429) {
      throw new OpenDotaQuotaError("OpenDota responded with 429 (rate limit)", {
        statusCode,
      });
    }

    throw error;
  }
}

export async function fetchMatchDetails(matchId) {
  const endpoint = `/matches/${matchId}`;
  const method = "GET";
  const startedAt = Date.now();

  try {
    await assertOpenDotaQuotaAvailable();
    const response = await opendotaClient.get(endpoint);
    const durationMs = Date.now() - startedAt;

    await logApiUsage({
      endpoint,
      method,
      statusCode: response.status,
      durationMs,
      success: true,
      payload: { matchId },
    });

    return response.data;
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const statusCode = error.response?.status || 500;

    await logApiUsage({
      endpoint,
      method,
      statusCode,
      durationMs,
      success: false,
      payload: { message: error.message, matchId },
    });

    if (statusCode === 429) {
      throw new OpenDotaQuotaError("OpenDota responded with 429 (rate limit)", {
        statusCode,
      });
    }

    throw error;
  }
}
