export function createAdminFeature({
  HERO_SYNC_REQUEST_TIMEOUT_MS,
  apiRequest,
  loadHeroCatalogForRecommendation,
  loadHeroes,
  runWithButtonLoading,
  setNotice,
  state,
  t = null,
  getLanguage = null,
}) {
  const translate = (key, fallback) => (typeof t === "function" ? t(key, fallback) : fallback);

  function renderUsers(rows) {
    const tbody = document.querySelector("#usersTable tbody");
    tbody.innerHTML = "";

    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="5">${translate("admin.noUsers", "Nav lietotāju.")}</td></tr>`;
      return;
    }

    rows.forEach((user) => {
      const isOwnAdmin = state.user?.role === "ADMIN" && Number(user.id) === Number(state.user?.id);
      const roleSelectDisabled = isOwnAdmin ? "disabled" : "";
      const saveDisabled = isOwnAdmin ? "disabled" : "";
      const saveTitle = isOwnAdmin
        ? `title="${translate("admin.cannotRemoveOwnAdmin", "Savu ADMIN lomu noņemt nedrīkst.")}"`
        : "";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${user.id}</td>
        <td>${user.username || "-"}</td>
        <td>${user.email}</td>
        <td>
          <select data-user-role="${user.id}" ${roleSelectDisabled}>
            <option value="USER" ${user.role === "USER" ? "selected" : ""}>USER</option>
            <option value="ADMIN" ${user.role === "ADMIN" ? "selected" : ""}>ADMIN</option>
          </select>
        </td>
        <td><button data-save-user="${user.id}" class="secondary" ${saveDisabled} ${saveTitle}>${translate("common.save", "Saglabāt")}</button></td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll("button[data-save-user]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const userId = btn.dataset.saveUser;
        const roleSelect = tbody.querySelector(`select[data-user-role="${userId}"]`);
        const role = roleSelect?.value;

        if (!role) {
          return;
        }

        try {
          await apiRequest(`/users/${userId}/role`, {
            method: "PATCH",
            auth: true,
            body: { role },
          });
          setNotice(translate("admin.roleUpdated", "Loma atjaunota."), "success");
        } catch (error) {
          setNotice(error.message);
        }
      });
    });
  }

  function renderLogs(rows) {
    const tbody = document.querySelector("#logsTable tbody");
    tbody.innerHTML = "";

    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="6">${translate("admin.noLogs", "Nav logu.")}</td></tr>`;
      return;
    }

    const locale = typeof getLanguage === "function" ? getLanguage() : "lv";
    const localeMap = {
      lv: "lv-LV",
      en: "en-US",
      ru: "ru-RU",
    };

    rows.forEach((log) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${new Date(log.requestedAt).toLocaleString(localeMap[locale] || "lv-LV")}</td>
        <td>${log.provider}</td>
        <td>${log.endpoint}</td>
        <td>${log.statusCode}</td>
        <td>${log.durationMs}</td>
        <td>${log.success ? translate("common.yes", "Jā") : translate("common.no", "Nē")}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function wireAdmin() {
    const syncHeroesBtn = document.querySelector("#syncHeroesBtn");
    const loadUsersBtn = document.querySelector("#loadUsersBtn");
    const loadLogsBtn = document.querySelector("#loadLogsBtn");

    syncHeroesBtn.addEventListener("click", async () => {
      await runWithButtonLoading(syncHeroesBtn, translate("admin.syncing", "Sinhronizē..."), async () => {
        try {
          const result = await apiRequest("/heroes/sync", {
            method: "POST",
            auth: true,
            timeoutMs: HERO_SYNC_REQUEST_TIMEOUT_MS,
          });
          state.statsLoaded = false;
          const syncedCount = Number(result?.synced || 0);
          setNotice(
            result.message ||
              translate("admin.heroesSyncedCount", "Varoņi sinhronizēti: {count}.").replace(
                "{count}",
                String(syncedCount),
              ),
            "success",
          );
          await loadHeroes();
          await loadHeroCatalogForRecommendation();
        } catch (error) {
          if (String(error.message || "").includes("Backend atbild pārāk ilgi")) {
            setNotice(translate("admin.syncTakesLong", "Sinhronizācija aizņem ilgāku laiku. Pagaidi un mēģini vēlreiz."));
          } else {
            setNotice(error.message);
          }
        }
      });
    });

    loadUsersBtn.addEventListener("click", async () => {
      await runWithButtonLoading(loadUsersBtn, translate("common.loading", "Ielādē..."), async () => {
        try {
          const result = await apiRequest("/users?limit=100", { auth: true });
          renderUsers(result.data || []);
          setNotice(translate("admin.usersLoaded", "Lietotāji ielādēti."), "success");
        } catch (error) {
          setNotice(error.message);
        }
      });
    });

    loadLogsBtn.addEventListener("click", async () => {
      await runWithButtonLoading(loadLogsBtn, translate("common.loading", "Ielādē..."), async () => {
        try {
          const result = await apiRequest("/logs/external-api", { auth: true });
          renderLogs(result.data || []);
          setNotice(translate("admin.logsLoaded", "Logi ielādēti."), "success");
        } catch (error) {
          setNotice(error.message);
        }
      });
    });
  }

  return {
    wireAdmin,
  };
}
