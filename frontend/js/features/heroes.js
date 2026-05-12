export function createHeroesFeature({
  state,
  apiRequest,
  setNotice,
  runWithButtonLoading,
  compactRoleBadges,
  formatPrimaryAttr,
  getHeroImageUrlByNameOrId,
  t = null,
}) {
  let currentHeroRows = [];

  function getHeroById(heroId) {
    return state.heroCatalog.find((hero) => Number(hero.id) === Number(heroId)) || null;
  }

  function removeFromArray(values, id) {
    return values.filter((value) => Number(value) !== Number(id));
  }

  function formatAttackType(attackType) {
    if (attackType === "Melee") {
      return typeof t === "function" ? t("attack.melee", "Melee") : "Melee";
    }

    if (attackType === "Ranged") {
      return typeof t === "function" ? t("attack.ranged", "Ranged") : "Ranged";
    }

    return "-";
  }

  function formatHeroRole(role) {
    const normalizedRole = String(role || "").trim().toLowerCase();
    if (!normalizedRole) {
      return "-";
    }

    return typeof t === "function" ? t(`heroRole.${normalizedRole}`, role) : role;
  }

  function renderRoleBadges(roles) {
    return compactRoleBadges(roles, formatHeroRole);
  }

  function renderTeamList(containerId, heroIds, side) {
    const container = document.querySelector(containerId);
    if (!container) {
      return;
    }

    container.innerHTML = "";

    if (!heroIds.length) {
      const empty = document.createElement("p");
      empty.className = "section-help";
      empty.textContent = typeof t === "function" ? t("heroes.emptySelection", "Nav izvēlētu varoņu.") : "Nav izvēlētu varoņu.";
      container.appendChild(empty);
      return;
    }

    heroIds.forEach((heroId) => {
      const hero = getHeroById(heroId);
      const imageUrl = getHeroImageUrlByNameOrId(hero || { id: heroId });
      const row = document.createElement("div");
      row.className = "team-item";
      row.innerHTML = `
        <div class="hero-cell">
          ${imageUrl ? `<img src="${imageUrl}" alt="${hero ? hero.localizedName : `Hero #${heroId}`}" class="hero-avatar" loading="lazy" />` : ""}
          <span>${hero ? hero.localizedName : `Hero #${heroId}`}</span>
        </div>
        <button type="button" class="secondary tiny-btn" data-remove-side="${side}" data-hero-id="${heroId}">
          ${typeof t === "function" ? t("common.remove", "Noņemt") : "Noņemt"}
        </button>
      `;
      container.appendChild(row);
    });

    container.querySelectorAll("button[data-remove-side]").forEach((button) => {
      button.addEventListener("click", () => {
        const sideName = button.dataset.removeSide;
        const heroId = Number(button.dataset.heroId);

        if (sideName === "ally") {
          state.selectedAllies = removeFromArray(state.selectedAllies, heroId);
        } else {
          state.selectedEnemies = removeFromArray(state.selectedEnemies, heroId);
        }

        renderTeamSelections();
        renderHeroPickerList();
      });
    });
  }

  function renderTeamSelections() {
    renderTeamList("#allyTeamList", state.selectedAllies, "ally");
    renderTeamList("#enemyTeamList", state.selectedEnemies, "enemy");

    const allyCount = document.querySelector("#allyCount");
    const enemyCount = document.querySelector("#enemyCount");
    if (allyCount) {
      allyCount.textContent = String(state.selectedAllies.length);
    }
    if (enemyCount) {
      enemyCount.textContent = String(state.selectedEnemies.length);
    }
  }

  function closeHeroPicker() {
    const modal = document.querySelector("#heroPickerModal");
    if (modal) {
      modal.hidden = true;
    }

    state.pickerTarget = null;
  }

  function getFilteredHeroesForPicker() {
    const searchValue = String(document.querySelector("#pickerSearchInput")?.value || "")
      .trim()
      .toLowerCase();
    const attrValue = String(document.querySelector("#pickerAttrSelect")?.value || "").trim().toLowerCase();
    const attackValue = String(document.querySelector("#pickerAttackSelect")?.value || "")
      .trim()
      .toLowerCase();
    const roleValue = String(document.querySelector("#pickerRoleSelect")?.value || "")
      .trim()
      .toLowerCase();

    return state.heroCatalog.filter((hero) => {
      const nameMatch =
        !searchValue ||
        String(hero.localizedName || "")
          .toLowerCase()
          .includes(searchValue);
      const attrMatch = !attrValue || String(hero.primaryAttr || "").toLowerCase() === attrValue;
      const attackMatch = !attackValue || String(hero.attackType || "").toLowerCase() === attackValue;
      const roleMatch =
        !roleValue ||
        (Array.isArray(hero.roles) &&
          hero.roles.some((role) => String(role).toLowerCase() === roleValue));

      return nameMatch && attrMatch && attackMatch && roleMatch;
    });
  }

  function canAddHeroToTarget(heroId, target) {
    if (target === "ally") {
      if (state.selectedAllies.includes(heroId)) {
        return { ok: false, message: typeof t === "function" ? t("heroes.error.alreadyAlly", "Varonis jau ir sabiedroto sarakstā.") : "Varonis jau ir sabiedroto sarakstā." };
      }
      if (state.selectedAllies.length >= 5) {
        return { ok: false, message: typeof t === "function" ? t("heroes.error.maxAllies", "Sabiedroto sarakstā var būt ne vairāk kā 5 varoņi.") : "Sabiedroto sarakstā var būt ne vairāk kā 5 varoņi." };
      }
      if (state.selectedEnemies.includes(heroId)) {
        return { ok: false, message: typeof t === "function" ? t("heroes.error.alreadyEnemy", "Šis varonis jau ir pretinieku sarakstā.") : "Šis varonis jau ir pretinieku sarakstā." };
      }
    } else {
      if (state.selectedEnemies.includes(heroId)) {
        return { ok: false, message: typeof t === "function" ? t("heroes.error.enemyAlreadySelected", "Varonis jau ir pretinieku sarakstā.") : "Varonis jau ir pretinieku sarakstā." };
      }
      if (state.selectedEnemies.length >= 5) {
        return { ok: false, message: typeof t === "function" ? t("heroes.error.maxEnemies", "Pretinieku sarakstā var būt ne vairāk kā 5 varoņi.") : "Pretinieku sarakstā var būt ne vairāk kā 5 varoņi." };
      }
      if (state.selectedAllies.includes(heroId)) {
        return { ok: false, message: typeof t === "function" ? t("heroes.error.alreadyAllyFromEnemy", "Šis varonis jau ir sabiedroto sarakstā.") : "Šis varonis jau ir sabiedroto sarakstā." };
      }
    }

    return { ok: true };
  }

  function renderHeroPickerList() {
    const list = document.querySelector("#heroPickerList");
    if (!list) {
      return;
    }

    list.innerHTML = "";

    const target = state.pickerTarget;
    if (!target) {
      return;
    }

    const filtered = getFilteredHeroesForPicker();
    if (!filtered.length) {
      list.innerHTML = `<p class='section-help'>${typeof t === "function" ? t("heroes.noResults", "Nav atrastu varoņu.") : "Nav atrastu varoņu."}</p>`;
      return;
    }

    filtered.forEach((hero) => {
      const heroId = Number(hero.id);
      const eligibility = canAddHeroToTarget(heroId, target);
      const attackType = formatAttackType(hero.attackType);
      const imageUrl = getHeroImageUrlByNameOrId(hero);

      const row = document.createElement("div");
      row.className = "picker-row";
      row.innerHTML = `
        <div class="hero-cell">
          ${imageUrl ? `<img src="${imageUrl}" alt="${hero.localizedName}" class="hero-avatar" loading="lazy" />` : ""}
          <div>
            <strong>${hero.localizedName}</strong>
          <div class="picker-meta">
            ${formatPrimaryAttr(hero.primaryAttr)} · ${attackType}
          </div>
            <div class="role-badges">${renderRoleBadges(hero.roles)}</div>
          </div>
        </div>
        <button type="button" data-add-hero-id="${hero.id}" ${eligibility.ok ? "" : "disabled"}>
          ${
            eligibility.ok
              ? typeof t === "function"
                ? t("common.add", "Pievienot")
                : "Pievienot"
              : typeof t === "function"
                ? t("common.unavailable", "Nav pieejams")
                : "Nav pieejams"
          }
        </button>
      `;
      list.appendChild(row);
    });

    list.querySelectorAll("button[data-add-hero-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const heroId = Number(button.dataset.addHeroId);
        const targetSide = state.pickerTarget;
        if (!targetSide) {
          return;
        }

        const eligibility = canAddHeroToTarget(heroId, targetSide);
        if (!eligibility.ok) {
          setNotice(eligibility.message);
          return;
        }

        if (targetSide === "ally") {
          state.selectedAllies.push(heroId);
        } else {
          state.selectedEnemies.push(heroId);
        }

        renderTeamSelections();
        renderHeroPickerList();
        setNotice(
          typeof t === "function" ? t("heroes.heroAdded", "Varonis pievienots.") : "Varonis pievienots.",
          "success",
        );
        closeHeroPicker();
      });
    });
  }

  function openHeroPicker(target) {
    if (!["ally", "enemy"].includes(target)) {
      return;
    }

    state.pickerTarget = target;
    const modal = document.querySelector("#heroPickerModal");
    const title = document.querySelector("#pickerTitle");
    if (title) {
      title.textContent =
        target === "ally"
          ? typeof t === "function"
            ? t("picker.ally", "Izvēlēties sabiedroto varoni")
            : "Izvēlēties sabiedroto varoni"
          : typeof t === "function"
            ? t("picker.enemy", "Izvēlēties pretinieka varoni")
            : "Izvēlēties pretinieka varoni";
    }
    if (modal) {
      modal.hidden = false;
    }

    renderHeroPickerList();
  }

  function renderHeroes(rows) {
    currentHeroRows = Array.isArray(rows) ? rows : [];
    const tbody = document.querySelector("#heroesTable tbody");
    const spotlightGrid = document.querySelector("#heroesSpotlightGrid");
    tbody.innerHTML = "";
    if (spotlightGrid) {
      spotlightGrid.innerHTML = "";
    }

    if (!currentHeroRows.length) {
      tbody.innerHTML = `<tr><td colspan="5">${typeof t === "function" ? t("common.noData", "Nav datu.") : "Nav datu."}</td></tr>`;
      if (spotlightGrid) {
        spotlightGrid.innerHTML = `<p class='section-help'>${
          typeof t === "function"
            ? t("heroes.noAvailableForFilters", "Nav pieejamu varoņu atlasītajiem filtriem.")
            : "Nav pieejamu varoņu atlasītajiem filtriem."
        }</p>`;
      }
      return;
    }

    currentHeroRows.forEach((hero) => {
      const attackType = formatAttackType(hero.attackType);
      const imageUrl = getHeroImageUrlByNameOrId(hero);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div class="hero-cell">
            ${imageUrl ? `<img src="${imageUrl}" alt="${hero.localizedName}" class="hero-avatar" loading="lazy" />` : ""}
            <strong>${hero.localizedName}</strong>
          </div>
        </td>
        <td>${formatPrimaryAttr(hero.primaryAttr)}</td>
        <td>${attackType}</td>
        <td><strong>${Number(hero.rawWinRate || 0).toFixed(2)}%</strong></td>
        <td><div class="role-badges">${renderRoleBadges(hero.roles)}</div></td>
      `;
      tbody.appendChild(tr);
    });

    if (spotlightGrid) {
      currentHeroRows.slice(0, 12).forEach((hero) => {
        const imageUrl = getHeroImageUrlByNameOrId(hero);
        const card = document.createElement("article");
        card.className = "hero-quick-card";
        card.innerHTML = `
          <div class="hero-cell">
            ${imageUrl ? `<img src="${imageUrl}" alt="${hero.localizedName}" class="hero-avatar" loading="lazy" />` : ""}
            <h4>${hero.localizedName}</h4>
          </div>
          <div class="hero-quick-meta">${formatPrimaryAttr(hero.primaryAttr)} · ${formatAttackType(hero.attackType)}</div>
          <div class="hero-quick-meta">${
            typeof t === "function" ? t("heroes.winrateLabel", "Winrate") : "Winrate"
          }: <strong>${Number(hero.rawWinRate || 0).toFixed(2)}%</strong></div>
        `;
        spotlightGrid.appendChild(card);
      });
    }
  }

  function rerenderHeroes() {
    renderHeroes(currentHeroRows);
  }

  async function loadHeroes() {
    const form = document.querySelector("#heroesFilterForm");
    const formData = new FormData(form);
    const params = new URLSearchParams();

    ["search", "primaryAttr", "attackType", "role", "sortBy", "order"].forEach((key) => {
      const value = String(formData.get(key) || "").trim();
      if (value) {
        params.set(key, value);
      }
    });

    params.set("limit", "500");

    const result = await apiRequest(`/heroes?${params.toString()}`);
    renderHeroes(result.data || []);
  }

  async function loadHeroCatalogForRecommendation() {
    const result = await apiRequest("/heroes?limit=500&sortBy=localizedName&order=asc");
    state.heroCatalog = Array.isArray(result.data) ? result.data : [];
    renderTeamSelections();
    renderHeroPickerList();
  }

  function wireHeroes() {
    const form = document.querySelector("#heroesFilterForm");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await runWithButtonLoading(form.querySelector("button[type='submit']"), "Atjauno...", async () => {
        try {
          await loadHeroes();
          setNotice(
            typeof t === "function" ? t("heroes.refreshed", "Varoņu saraksts atjaunots.") : "Varoņu saraksts atjaunots.",
            "success",
          );
        } catch (error) {
          setNotice(error.message);
        }
      });
    });
  }

  return {
    closeHeroPicker,
    loadHeroCatalogForRecommendation,
    loadHeroes,
    openHeroPicker,
    rerenderHeroes,
    renderHeroPickerList,
    renderTeamSelections,
    wireHeroes,
  };
}
