export function createStatsFeature({ apiRequest, getHeroImageUrlByNameOrId, setNotice, state, t = null }) {
  const translate = (key, fallback) => (typeof t === "function" ? t(key, fallback) : fallback);

  function renderStatsPlaceholders(message = "Nav datu.") {
    const heroBody = document.querySelector("#statsByHeroTable tbody");
    const summary = document.querySelector("#statsFilterSummary");
    const summaryCards = document.querySelector("#statsSummaryCards");

    if (heroBody) {
      heroBody.innerHTML = `<tr><td colspan="3">${message}</td></tr>`;
    }
    if (summary) {
      summary.textContent = message;
    }
    if (summaryCards) {
      summaryCards.innerHTML = `
        <div class="summary-card"><span class="label">${translate("stats.summary.heroes", "Varoņu skaits")}</span><span class="value">-</span></div>
        <div class="summary-card"><span class="label">${translate("stats.summary.avgWinrate", "Vidējais winrate")}</span><span class="value">-</span></div>
        <div class="summary-card"><span class="label">${translate("stats.summary.avgPickrate", "Vidējais pickrate")}</span><span class="value">-</span></div>
        <div class="summary-card"><span class="label">${translate("stats.summary.topHero", "Top varonis")}</span><span class="value">-</span></div>
      `;
    }
  }

  function readStatsFilters() {
    const form = document.querySelector("#statsFilterForm");
    if (!form) {
      return {
        search: "",
        primaryAttr: "",
        attackType: "",
      };
    }

    const formData = new FormData(form);
    return {
      search: String(formData.get("search") || "")
        .trim()
        .toLowerCase(),
      primaryAttr: String(formData.get("primaryAttr") || "")
        .trim()
        .toLowerCase(),
      attackType: String(formData.get("attackType") || "")
        .trim()
        .toLowerCase(),
    };
  }

  function filterAndSortHeroStats(heroStats, filters) {
    const filtered = heroStats.filter((row) => {
      const heroName = String(row.heroName || "").toLowerCase();
      const attr = String(row.primaryAttr || "").toLowerCase();
      const attackType = String(row.attackType || "").toLowerCase();

      const nameMatch = !filters.search || heroName.includes(filters.search);
      const attrMatch = !filters.primaryAttr || attr === filters.primaryAttr;
      const attackMatch = !filters.attackType || attackType === filters.attackType;

      return nameMatch && attrMatch && attackMatch;
    });

    const direction = state.statsWinrateOrder === "asc" ? 1 : -1;
    filtered.sort((a, b) => {
      const field = state.statsSortKey === "pickRate" ? "pickRate" : "winRate";
      const left = Number(a[field] || 0);
      const right = Number(b[field] || 0);
      if (left !== right) {
        return (left - right) * direction;
      }
      return String(a.heroName || "").localeCompare(String(b.heroName || ""));
    });

    return filtered;
  }

  function updateStatsSortButtonLabel() {
    const winrateBtn = document.querySelector("#statsWinrateSortBtn");
    const pickrateBtn = document.querySelector("#statsPickrateSortBtn");
    if (!winrateBtn || !pickrateBtn) {
      return;
    }

    const arrow = state.statsWinrateOrder === "asc" ? "↑" : "↓";
    const winrateLabel = translate("stats.sortWinrateBase", "Winrate");
    const pickrateLabel = translate("stats.sortPickrateBase", "Pickrate");
    winrateBtn.textContent = state.statsSortKey === "winRate" ? `${winrateLabel} ${arrow}` : winrateLabel;
    pickrateBtn.textContent = state.statsSortKey === "pickRate" ? `${pickrateLabel} ${arrow}` : pickrateLabel;
  }

  function renderStatsTables(data) {
    const heroBody = document.querySelector("#statsByHeroTable tbody");
    const summary = document.querySelector("#statsFilterSummary");
    const summaryCards = document.querySelector("#statsSummaryCards");

    heroBody.innerHTML = "";

    const allHeroStats = data?.heroStats || [];
    const filters = readStatsFilters();
    const byHero = filterAndSortHeroStats(allHeroStats, filters);

    const totalHeroes = byHero.length;
    const avgWinRate =
      totalHeroes > 0
        ? (byHero.reduce((sum, row) => sum + Number(row.winRate || 0), 0) / totalHeroes).toFixed(2)
        : "0.00";
    const avgPickRate =
      totalHeroes > 0
        ? (byHero.reduce((sum, row) => sum + Number(row.pickRate || 0), 0) / totalHeroes).toFixed(2)
        : "0.00";
    const topHero =
      byHero.length > 0
        ? [...byHero].sort((a, b) => Number(b.winRate || 0) - Number(a.winRate || 0))[0]?.heroName || "-"
        : "-";

    if (summary) {
      summary.textContent = translate("stats.foundSummary", "Atrasti varoņi: {count} no {total}")
        .replace("{count}", String(byHero.length))
        .replace("{total}", String(allHeroStats.length));
    }
    if (summaryCards) {
      summaryCards.innerHTML = `
        <div class="summary-card">
          <span class="label">${translate("stats.summary.heroes", "Varoņu skaits")}</span>
          <span class="value">${totalHeroes}</span>
        </div>
        <div class="summary-card">
          <span class="label">${translate("stats.summary.avgWinrate", "Vidējais winrate")}</span>
          <span class="value">${avgWinRate}%</span>
        </div>
        <div class="summary-card">
          <span class="label">${translate("stats.summary.avgPickrate", "Vidējais pickrate")}</span>
          <span class="value">${avgPickRate}%</span>
        </div>
        <div class="summary-card">
          <span class="label">${translate("stats.summary.topHero", "Top varonis")}</span>
          <span class="value">${topHero}</span>
        </div>
      `;
    }

    if (!byHero.length) {
      heroBody.innerHTML = `<tr><td colspan="3">${translate("common.noData", "Nav datu.")}</td></tr>`;
    } else {
      byHero.forEach((row) => {
        const heroName = String(row.heroName || "");
        const imageUrl = String(row.imageUrl || "").trim() || getHeroImageUrlByNameOrId({ localizedName: heroName });

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>
            <div class="hero-cell">
              ${imageUrl ? `<img src="${imageUrl}" alt="${heroName}" class="hero-avatar" loading="lazy" />` : ""}
              <span>${heroName}</span>
            </div>
          </td>
          <td><strong>${Number(row.winRate || 0).toFixed(2)}%</strong></td>
          <td><strong>${Number(row.pickRate || 0).toFixed(2)}%</strong></td>
        `;
        heroBody.appendChild(tr);
      });
    }
  }

  async function loadStatsData() {
    if (state.statsLoaded || state.statsLoading) {
      return;
    }

    state.statsLoading = true;
    renderStatsPlaceholders(translate("stats.loading", "Ielādē statistiku..."));
    try {
      const result = await apiRequest("/stats/heroes");
      state.statsData = result.data || null;
      renderStatsTables(state.statsData);
      state.statsLoaded = true;
    } catch (error) {
      setNotice(error.message);
      state.statsData = null;
      renderStatsPlaceholders(translate("stats.loadFailed", "Neizdevās ielādēt statistiku."));
    } finally {
      state.statsLoading = false;
    }
  }

  function wireStats() {
    renderStatsPlaceholders(translate("stats.openSection", "Atver sadaļu, lai ielādētu statistiku."));
    updateStatsSortButtonLabel();

    const form = document.querySelector("#statsFilterForm");
    const rerender = () => {
      if (state.statsData) {
        renderStatsTables(state.statsData);
      }
    };

    form?.addEventListener("input", rerender);
    form?.addEventListener("change", rerender);

    const handleSortClick = (sortKey) => {
      if (state.statsSortKey === sortKey) {
        state.statsWinrateOrder = state.statsWinrateOrder === "desc" ? "asc" : "desc";
      } else {
        state.statsSortKey = sortKey;
        state.statsWinrateOrder = "desc";
      }
      updateStatsSortButtonLabel();
      rerender();
    };

    const winrateBtn = document.querySelector("#statsWinrateSortBtn");
    winrateBtn?.addEventListener("click", () => {
      handleSortClick("winRate");
    });

    const pickrateBtn = document.querySelector("#statsPickrateSortBtn");
    pickrateBtn?.addEventListener("click", () => {
      handleSortClick("pickRate");
    });
  }

  return {
    loadStatsData,
    rerenderStats: () => {
      if (state.statsData) {
        renderStatsTables(state.statsData);
      } else if (!state.statsLoading) {
        renderStatsPlaceholders(translate("stats.openSection", "Atver sadaļu, lai ielādētu statistiku."));
      }
      updateStatsSortButtonLabel();
    },
    wireStats,
  };
}
