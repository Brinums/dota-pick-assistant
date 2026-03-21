import { prisma } from "../lib/prisma.js";

export async function getExternalApiLogs(req, res, next) {
  try {
    const logs = await prisma.apiUsageLog.findMany({
      orderBy: { requestedAt: "desc" },
      take: 50,
    });

    return res.json({ data: logs });
  } catch (error) {
    return next(error);
  }
}
