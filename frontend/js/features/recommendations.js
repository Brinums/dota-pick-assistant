export function createRecommendationsFeature({
  RECOMMENDATION_REQUEST_TIMEOUT_MS,
  apiRequest,
  closeAuthPanels,
  closeHeroPicker,
  getHeroImageUrlByNameOrId,
  openHeroPicker,
  renderHeroPickerList,
  renderTeamSelections,
  resetAuthForms,
  runWithButtonLoading,
  setNotice,
  state,
  t = null,
}) {
  const translate = (key, fallback) => (typeof t === "function" ? t(key, fallback) : fallback);

  function renderRecommendationResults(rows) {
    const container = document.querySelector("#recommendResult");
    container.innerHTML = "";

    if (!rows.length) {
      container.innerHTML = `<p class='section-help'>${translate(
        "recommend.noResults",
        "Nav rezultātu. Izvēlies varoņus un ģenerē ieteikumus.",
      )}</p>`;
      return;
    }

    rows.forEach((row, index) => {
      const confidenceScore = Number(row.confidence?.score || 0).toFixed(2);
      const confidenceLabel = row.confidence?.label || translate("recommend.confidence.low", "Low");
      const counterWr = Number(row.modelMetrics?.counterWinRate || 0).toFixed(2);
      const synergyWr = Number(row.modelMetrics?.synergyWinRate || 0).toFixed(2);
      const counterGames = Number(row.modelMetrics?.counterGames || 0);
      const synergyGames = Number(row.modelMetrics?.synergyGames || 0);
      const heroTitle = row.suggestedHero?.localizedName || `Hero #${row.suggestedHeroId}`;
      const imageUrl = getHeroImageUrlByNameOrId({
        ...row.suggestedHero,
        id: row.suggestedHero?.id || row.suggestedHeroId,
      });
      const score = Number(row.score || 0).toFixed(2);

      const div = document.createElement("div");
      div.className = `result-item ${index === 0 ? "best-pick" : ""}`.trim();
      div.innerHTML = `
        <div class="result-head">
          <div class="result-hero">
            ${imageUrl ? `<img src="${imageUrl}" alt="${heroTitle}" class="hero-avatar" loading="lazy" />` : ""}
            <div>
              <strong>${heroTitle}</strong>
              <div class="section-help">${
                index === 0
                  ? translate("recommend.bestPick", "Labākā izvēle šim sastāvam")
                  : `${translate("recommend.alternative", "Alternatīva")} #${index + 1}`
              }</div>
            </div>
          </div>
          <div>
            <div class="result-rank">#${index + 1}</div>
            <div class="result-score">${score}</div>
          </div>
        </div>
        <div class="result-metrics">
          <div class="metric-chip">
            <strong>${translate("recommend.confidence", "Pārliecība")}</strong>
            <span>${confidenceScore}%</span>
            <small>${confidenceLabel}</small>
          </div>
          <div class="metric-chip">
            <strong>CounterWR</strong>
            <span>${counterWr}%</span>
            <small>${counterGames} ${translate("common.games", "spēles")}</small>
          </div>
          <div class="metric-chip">
            <strong>SynergyWR</strong>
            <span>${synergyWr}%</span>
            <small>${synergyGames} ${translate("common.games", "spēles")}</small>
          </div>
        </div>
      `;
      container.appendChild(div);
    });
  }

  function compactReason(reason) {
    if (!reason) {
      return "-";
    }

    const chunks = String(reason)
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean);

    const visible = chunks.filter(
      (item) =>
        item.startsWith("CounterWR:") || item.startsWith("SynergyWR:") || item.startsWith("Role:"),
    );

    if (visible.length) {
      return visible.join(" | ");
    }

    return String(reason).slice(0, 120);
  }

  function renderMyRecommendations(rows) {
    const tbody = document.querySelector("#myRecommendationsTable tbody");
    tbody.innerHTML = "";

    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="5">${translate("recommend.empty", "Nav ieteikumu.")}</td></tr>`;
      return;
    }

    rows.forEach((item) => {
      const shortReason = compactReason(item.reason);
      const heroName = item.suggestedHero?.localizedName || item.suggestedHeroId;
      const imageUrl = getHeroImageUrlByNameOrId({
        ...item.suggestedHero,
        id: item.suggestedHero?.id || item.suggestedHeroId,
      });
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.id}</td>
        <td>
          <div class="hero-cell">
            ${imageUrl ? `<img src="${imageUrl}" alt="${heroName}" class="hero-avatar" loading="lazy" />` : ""}
            <span>${heroName}</span>
          </div>
        </td>
        <td><strong>${Number(item.score || 0).toFixed(2)}</strong></td>
        <td>${shortReason}</td>
        <td><button data-delete-id="${item.id}" class="secondary">${translate("common.delete", "Dzēst")}</button></td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll("button[data-delete-id]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          await apiRequest(`/recommendations/${btn.dataset.deleteId}`, {
            method: "DELETE",
            auth: true,
          });
          state.statsLoaded = false;
          setNotice(translate("recommend.deleted", "Ieteikums dzēsts."), "success");
          await loadMyRecommendations();
        } catch (error) {
          setNotice(error.message);
        }
      });
    });
  }

  async function loadMyRecommendations({ silent = false } = {}) {
    if (!state.token) {
      renderMyRecommendations([]);
      return [];
    }

    try {
      const result = await apiRequest("/recommendations/me?limit=50", { auth: true });
      const rows = result.data || [];
      renderMyRecommendations(rows);
      return rows;
    } catch (error) {
      if (silent) {
        renderMyRecommendations([]);
        return [];
      }
      throw error;
    }
  }

  function wireRecommendations() {
    const form = document.querySelector("#recommendForm");
    const loadBtn = document.querySelector("#loadMyRecommendationsBtn");
    const autoRefreshRecentMatchesCheckbox = document.querySelector("#autoRefreshRecentMatches");
    const recentMatchesLimitInput = document.querySelector("#recentMatchesLimit");
    const chooseAllyBtn = document.querySelector("#chooseAllyBtn");
    const chooseEnemyBtn = document.querySelector("#chooseEnemyBtn");
    const clearAllyBtn = document.querySelector("#clearAllyBtn");
    const clearEnemyBtn = document.querySelector("#clearEnemyBtn");
    const closePickerBtn = document.querySelector("#closeHeroPickerBtn");
    const pickerSearchInput = document.querySelector("#pickerSearchInput");
    const pickerAttrSelect = document.querySelector("#pickerAttrSelect");
    const pickerAttackSelect = document.querySelector("#pickerAttackSelect");
    const pickerRoleSelect = document.querySelector("#pickerRoleSelect");
    const pickerModal = document.querySelector("#heroPickerModal");
    let pickerBackdropPressed = false;

    chooseAllyBtn?.addEventListener("click", () => openHeroPicker("ally"));
    chooseEnemyBtn?.addEventListener("click", () => openHeroPicker("enemy"));
    clearAllyBtn?.addEventListener("click", () => {
      state.selectedAllies = [];
      renderTeamSelections();
      renderHeroPickerList();
    });
    clearEnemyBtn?.addEventListener("click", () => {
      state.selectedEnemies = [];
      renderTeamSelections();
      renderHeroPickerList();
    });

    closePickerBtn?.addEventListener("click", closeHeroPicker);
    pickerModal?.addEventListener("mousedown", (event) => {
      pickerBackdropPressed = event.target === pickerModal;
    });
    pickerModal?.addEventListener("click", (event) => {
      if (event.target === pickerModal && pickerBackdropPressed) {
        closeHeroPicker();
      }
      pickerBackdropPressed = false;
    });
    pickerModal?.addEventListener("mouseup", () => {
      pickerBackdropPressed = false;
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeHeroPicker();
        closeAuthPanels();
        resetAuthForms();
      }
    });

    [pickerSearchInput, pickerAttrSelect, pickerAttackSelect, pickerRoleSelect].forEach((element) => {
      element?.addEventListener("input", renderHeroPickerList);
      element?.addEventListener("change", renderHeroPickerList);
    });

    const syncLiveRefreshControls = () => {
      if (!recentMatchesLimitInput) {
        return;
      }

      const isEnabled = Boolean(autoRefreshRecentMatchesCheckbox?.checked);
      recentMatchesLimitInput.disabled = !isEnabled;
      const normalizedLimit = Math.max(1, Math.min(10, Number(recentMatchesLimitInput.value) || 5));
      recentMatchesLimitInput.value = String(normalizedLimit);
    };

    autoRefreshRecentMatchesCheckbox?.addEventListener("change", syncLiveRefreshControls);
    syncLiveRefreshControls();

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!state.token) {
        setNotice(translate("auth.loginRequired", "Vispirms jāpieslēdzas sistēmai."));
        return;
      }

      await runWithButtonLoading(form.querySelector("button[type='submit']"), translate("common.calculating", "Aprēķina..."), async () => {
        try {
          const formData = new FormData(form);
          const currentTeam = [...state.selectedAllies];
          const enemyTeam = [...state.selectedEnemies];

          if (currentTeam.length < 1 || enemyTeam.length < 1) {
            throw new Error(translate("recommend.validation.minOnePerTeam", "Abās komandās jāizvēlas vismaz 1 varonis."));
          }

          if (currentTeam.length > 5 || enemyTeam.length > 5) {
            throw new Error(
              translate("recommend.validation.maxFivePerTeam", "Katrā komandā drīkst izvēlēties ne vairāk kā 5 varoņus."),
            );
          }

          const ownSet = new Set(currentTeam);
          const hasOverlap = enemyTeam.some((id) => ownSet.has(id));
          if (hasOverlap) {
            throw new Error(
              translate("recommend.validation.noOverlap", "Viens un tas pats varonis nedrīkst būt abās komandās."),
            );
          }

          const payload = {
            currentTeam,
            enemyTeam,
            topN: Number(formData.get("topN") || 3),
            minMatchupGames: Number(formData.get("minMatchupGames") || 8),
            minSynergyGames: Number(formData.get("minSynergyGames") || 8),
            autoRefreshRecentMatches: Boolean(formData.get("autoRefreshRecentMatches")),
          };

          if (payload.autoRefreshRecentMatches) {
            payload.recentMatchesLimit = Math.max(
              1,
              Math.min(10, Number(formData.get("recentMatchesLimit") || 5)),
            );
          }

          const desiredRole = String(formData.get("desiredRole") || "").trim();
          if (desiredRole) {
            payload.desiredRole = desiredRole;
          }

          const result = await apiRequest("/recommendations", {
            method: "POST",
            auth: true,
            body: payload,
            timeoutMs: RECOMMENDATION_REQUEST_TIMEOUT_MS,
          });

          renderRecommendationResults(result.data || []);
          state.statsLoaded = false;
          const refreshMeta = result.meta?.liveRefresh;
          let successMessage = translate("recommend.success.created", "Ieteikumi izveidoti.");

          if (refreshMeta?.reason === "disabled_by_request") {
            successMessage = translate("recommend.success.localOnly", "Ieteikumi izveidoti tikai no lokālās datubāzes.");
          } else if (refreshMeta?.reason === "disabled_for_non_admin") {
            successMessage = translate(
              "recommend.success.localOnlyNonAdmin",
              "Ieteikumi izveidoti no lokālās datubāzes. Papildu maču ielāde pieejama tikai administrēšanā.",
            );
          } else if (refreshMeta?.reason === "quota_exceeded") {
            successMessage = translate(
              "recommend.success.quota",
              "Ieteikumi izveidoti no lokālās datubāzes (OpenDota limits sasniegts).",
            );
          } else if (refreshMeta?.reason === "no_new_matches") {
            successMessage = translate(
              "recommend.success.noNewMatches",
              "Ieteikumi izveidoti (jauni mači netika atrasti, izmantota lokālā datubāze).",
            );
          } else if (refreshMeta?.refreshed) {
            const syncedMatches = Number(refreshMeta?.matches?.synced || 0);
            successMessage =
              syncedMatches > 0
                ? translate(
                    "recommend.success.loadedExtraMatches",
                    "Ieteikumi izveidoti. Papildus ielādēti {count} mači.",
                  ).replace("{count}", String(syncedMatches))
                : translate(
                    "recommend.success.refreshed",
                    "Ieteikumi izveidoti ar papildus datu atjaunošanu.",
                  );
          }

          setNotice(successMessage, "success");
          await loadMyRecommendations();
        } catch (error) {
          if (String(error.message || "").includes("Backend atbild pārāk ilgi")) {
            setNotice(
              translate(
                "recommend.timeout",
                "Ieteikumu aprēķins aizņem ilgāku laiku. Mēģini vēlreiz pēc dažām sekundēm.",
              ),
            );
          } else {
            setNotice(error.message);
          }
        }
      });
    });

    loadBtn.addEventListener("click", async () => {
      if (!state.token) {
        setNotice(translate("auth.loginRequired", "Vispirms jāpieslēdzas sistēmai."));
        return;
      }

      await runWithButtonLoading(loadBtn, translate("common.loading", "Ielādē..."), async () => {
        try {
          await loadMyRecommendations();
          setNotice(translate("recommend.loaded", "Ieteikumi ielādēti."), "success");
        } catch (error) {
          setNotice(error.message);
        }
      });
    });
  }

  return {
    loadMyRecommendations,
    renderMyRecommendations,
    renderRecommendationResults,
    wireRecommendations,
  };
}
