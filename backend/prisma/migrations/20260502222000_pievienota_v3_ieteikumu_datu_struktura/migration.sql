-- CreateTable
CREATE TABLE "hero_matchups" (
    "heroId" INTEGER NOT NULL,
    "vsHeroId" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "gamesPlayed" INTEGER NOT NULL,
    "winRate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_matchups_pkey" PRIMARY KEY ("heroId","vsHeroId")
);

-- CreateTable
CREATE TABLE "hero_synergies" (
    "heroId" INTEGER NOT NULL,
    "withHeroId" INTEGER NOT NULL,
    "winsTogether" INTEGER NOT NULL,
    "gamesTogether" INTEGER NOT NULL,
    "winRate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_synergies_pkey" PRIMARY KEY ("heroId","withHeroId")
);

-- CreateIndex
CREATE INDEX "hero_matchups_vsHeroId_idx" ON "hero_matchups"("vsHeroId");

-- CreateIndex
CREATE INDEX "hero_matchups_gamesPlayed_idx" ON "hero_matchups"("gamesPlayed");

-- CreateIndex
CREATE INDEX "hero_synergies_withHeroId_idx" ON "hero_synergies"("withHeroId");

-- CreateIndex
CREATE INDEX "hero_synergies_gamesTogether_idx" ON "hero_synergies"("gamesTogether");

-- AddForeignKey
ALTER TABLE "hero_matchups" ADD CONSTRAINT "hero_matchups_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "heroes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero_matchups" ADD CONSTRAINT "hero_matchups_vsHeroId_fkey" FOREIGN KEY ("vsHeroId") REFERENCES "heroes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero_synergies" ADD CONSTRAINT "hero_synergies_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "heroes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero_synergies" ADD CONSTRAINT "hero_synergies_withHeroId_fkey" FOREIGN KEY ("withHeroId") REFERENCES "heroes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
