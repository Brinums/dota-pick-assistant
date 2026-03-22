import { prisma } from "../lib/prisma.js";

export async function getHeroStatistics(_req, res, next) {
  try {
    const heroes = await prisma.hero.findMany({
      select: {
        id: true,
        name: true,
        localizedName: true,
        primaryAttr: true,
        attackType: true,
        rawWinRate: true,
        proPick: true,
      },
      orderBy: [{ rawWinRate: "desc" }, { localizedName: "asc" }],
    });

    const totalProPick = heroes.reduce((sum, hero) => sum + Number(hero.proPick || 0), 0);

    const heroStats = heroes.map((hero) => {
      const proPick = Number(hero.proPick || 0);
      const pickRate = totalProPick > 0 ? (proPick / totalProPick) * 100 : 0;
      const shortName = String(hero.name || "").replace(/^npc_dota_hero_/, "");
      const imageUrl = shortName
        ? `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${shortName}.png`
        : null;

      return {
        heroId: hero.id,
        heroName: hero.localizedName,
        imageUrl,
        primaryAttr: hero.primaryAttr,
        attackType: hero.attackType,
        winRate: Number((hero.rawWinRate || 0).toFixed(2)),
        proPick,
        pickRate: Number(pickRate.toFixed(2)),
      };
    });

    return res.json({
      data: {
        heroStats,
      },
    });
  } catch (error) {
    return next(error);
  }
}
