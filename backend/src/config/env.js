import dotenv from "dotenv";

dotenv.config();

const requiredVars = ["DATABASE_URL", "JWT_SECRET", "OPENDOTA_BASE_URL"];

function readPositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

for (const envVar of requiredVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const env = {
  host: process.env.HOST || "0.0.0.0",
  port: Number(process.env.PORT || 4100),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  openDotaBaseUrl: process.env.OPENDOTA_BASE_URL,
  openDotaMinuteLimit: readPositiveInt(process.env.OPENDOTA_MINUTE_LIMIT, 60),
  openDotaDayLimit: readPositiveInt(process.env.OPENDOTA_DAY_LIMIT, 1000),
  corsOrigin: process.env.CORS_ORIGIN || "*",
};
