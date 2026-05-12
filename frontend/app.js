import {
  ACTIVE_VIEW_KEY,
  DEFAULT_LANGUAGE,
  DEFAULT_VIEW_ID,
  HERO_SYNC_REQUEST_TIMEOUT_MS,
  LANGUAGE_KEY,
  PROFILE_PAGE_KEY,
  PROFILE_PAGES,
  RECOMMENDATION_REQUEST_TIMEOUT_MS,
  state,
} from "./js/config.js";
import { apiRequest } from "./js/api.js";
import { createI18nFeature } from "./js/core/languages.js";
import { createNoticeManager } from "./js/core/notice.js";
import { createAdminFeature } from "./js/features/admin.js";
import { createAuthFeature } from "./js/features/auth.js";
import { createHeroesFeature } from "./js/features/heroes.js";
import { createNavigationFeature } from "./js/features/navigation.js";
import { createProfileFeature } from "./js/features/profile.js";
import { createRecommendationsFeature } from "./js/features/recommendations.js";
import { createStatsFeature } from "./js/features/stats.js";
import {
  attachFieldClearHandlers,
  clearInvalidFields,
  compactRoleBadges,
  formatPrimaryAttr,
  getHeroImageUrlByNameOrId,
  markFieldInvalid,
  parseBackendField,
  runWithButtonLoading,
  toValidationError,
  validateEmail,
  validatePassword,
  validateUsername,
} from "./js/utils.js";

const noticeEl = document.querySelector("#notice");
const currentUserInfo = document.querySelector("#currentUserInfo");

let i18nFeature = null;
const { setNotice } = createNoticeManager({
  noticeEl,
  translateMessage: (message) => i18nFeature?.translateMessage(message) || String(message || ""),
});

let profileFeature = null;
let navigationFeature = null;
let authFeature = null;
let heroesFeature = null;
let recommendationsFeature = null;
let statsFeature = null;
let adminFeature = null;

function getLocalizedUserRole(role) {
  const normalizedRole = String(role || "").trim().toUpperCase();

  if (normalizedRole === "ADMIN") {
    return i18nFeature?.t("role.admin", "Admin") || "Admin";
  }

  if (normalizedRole === "USER") {
    return i18nFeature?.t("role.user", "User") || "User";
  }

  return normalizedRole || "-";
}

function getCurrentUserLabel() {
  if (!state.user) {
    return i18nFeature?.t("auth.guest", "Viesis") || "Viesis";
  }

  const displayName = state.user.username || state.user.email;
  return `${displayName} (${getLocalizedUserRole(state.user.role)})`;
}

function updateToken(token) {
  state.token = token || "";

  if (state.token) {
    localStorage.setItem("dpa_token", state.token);
  } else {
    localStorage.removeItem("dpa_token");
  }
}

function syncAccessUi() {
  const isAuthenticated = Boolean(state.user);
  const isAdmin = state.user?.role === "ADMIN";
  const logoutBtn = document.querySelector("#logoutBtn");

  document.querySelectorAll(".auth-only").forEach((el) => {
    el.classList.toggle("auth-visible", isAuthenticated);
  });

  document.querySelectorAll(".admin-only").forEach((el) => {
    el.classList.toggle("admin-visible", isAuthenticated && isAdmin);
  });

  document.querySelectorAll(".guest-only").forEach((el) => {
    el.classList.toggle("guest-visible", !isAuthenticated);
  });

  if (logoutBtn) {
    logoutBtn.hidden = !isAuthenticated;
  }
}

function setUser(user, { closePanels = true } = {}) {
  const previousUserId = state.user?.id ?? null;
  const nextUserId = user?.id ?? null;
  const hasUserChanged = previousUserId !== nextUserId;

  state.user = user || null;
  state.statsLoaded = false;
  state.statsData = null;

  if (currentUserInfo) {
    currentUserInfo.textContent = getCurrentUserLabel();
  }

  if (!state.user) {
    profileFeature?.setProfilePage("overview");
  }

  const isAuthenticated = Boolean(state.user);
  const isAdmin = state.user?.role === "ADMIN";

  syncAccessUi();

  const activeViewId = document.querySelector(".view.active")?.id;
  if (!isAdmin && activeViewId === "adminView") {
    navigationFeature?.activateView(DEFAULT_VIEW_ID, { persist: !state.isBootstrapping });
  }

  if (!isAuthenticated && ["recommendView", "profileView"].includes(activeViewId || "")) {
    navigationFeature?.activateView(DEFAULT_VIEW_ID, { persist: !state.isBootstrapping });
  }

  if (isAuthenticated && ["loginView", "registerView"].includes(activeViewId || "")) {
    navigationFeature?.activateView(DEFAULT_VIEW_ID, { persist: !state.isBootstrapping });
  }

  if (activeViewId === "statsView") {
    void statsFeature?.loadStatsData();
  }

  if (hasUserChanged) {
    state.selectedAllies = [];
    state.selectedEnemies = [];
    heroesFeature?.renderTeamSelections();
    heroesFeature?.renderHeroPickerList();
    recommendationsFeature?.renderRecommendationResults([]);
    recommendationsFeature?.renderMyRecommendations([]);

    if (state.user && state.token) {
      void recommendationsFeature?.loadMyRecommendations({ silent: true });
    }
  }

  profileFeature?.renderProfileViewState();

  if (closePanels) {
    authFeature?.closeAuthPanels();
    authFeature?.resetAuthForms();
  }
}

async function restoreSession() {
  if (!state.token) {
    setUser(null);
    return;
  }

  try {
    const result = await apiRequest("/auth/me", { auth: true });
    setUser(result.data);
  } catch {
    updateToken("");
    setUser(null);
  }
}

async function bootstrap() {
  state.isBootstrapping = true;

  profileFeature = createProfileFeature({
    PROFILE_PAGE_KEY,
    PROFILE_PAGES,
    state,
    t: (...args) => i18nFeature?.t(...args),
  });

  i18nFeature = createI18nFeature({
    state,
    LANGUAGE_KEY,
    DEFAULT_LANGUAGE,
  });

  heroesFeature = createHeroesFeature({
    state,
    apiRequest,
    setNotice,
    runWithButtonLoading,
    compactRoleBadges,
    formatPrimaryAttr,
    getHeroImageUrlByNameOrId,
    t: (...args) => i18nFeature?.t(...args),
  });

  statsFeature = createStatsFeature({
    apiRequest,
    getHeroImageUrlByNameOrId,
    setNotice,
    state,
    t: (...args) => i18nFeature?.t(...args),
  });

  authFeature = createAuthFeature({
    activateView: (...args) => navigationFeature?.activateView(...args),
    apiRequest,
    attachFieldClearHandlers,
    clearInvalidFields,
    DEFAULT_VIEW_ID,
    markFieldInvalid,
    parseBackendField,
    renderProfileViewState: (...args) => profileFeature?.renderProfileViewState(...args),
    runWithButtonLoading,
    scrollToProfileTabs: (...args) => profileFeature?.scrollToProfileTabs(...args),
    setNotice,
    setProfilePage: (...args) => profileFeature?.setProfilePage(...args),
    setUser,
    state,
    syncAccessUi,
    toValidationError,
    updateToken,
    validateEmail,
    validatePassword,
    validateUsername,
    t: (...args) => i18nFeature?.t(...args),
  });

  navigationFeature = createNavigationFeature({
    ACTIVE_VIEW_KEY,
    DEFAULT_VIEW_ID,
    onCloseAuthPanels: () => authFeature?.closeAuthPanels(),
    onCloseHeroPicker: () => heroesFeature?.closeHeroPicker(),
    onLoadStatsData: () => statsFeature?.loadStatsData(),
    onOpenAuthPanel: () => authFeature?.openAuthPanel(),
    onSetProfilePage: (...args) => profileFeature?.setProfilePage(...args),
    setNotice,
    state,
  });

  recommendationsFeature = createRecommendationsFeature({
    RECOMMENDATION_REQUEST_TIMEOUT_MS,
    apiRequest,
    closeAuthPanels: () => authFeature?.closeAuthPanels(),
    closeHeroPicker: heroesFeature.closeHeroPicker,
    getHeroImageUrlByNameOrId,
    openHeroPicker: heroesFeature.openHeroPicker,
    renderHeroPickerList: heroesFeature.renderHeroPickerList,
    renderTeamSelections: heroesFeature.renderTeamSelections,
    resetAuthForms: () => authFeature?.resetAuthForms(),
    runWithButtonLoading,
    setNotice,
    state,
    t: (...args) => i18nFeature?.t(...args),
  });

  adminFeature = createAdminFeature({
    HERO_SYNC_REQUEST_TIMEOUT_MS,
    apiRequest,
    loadHeroCatalogForRecommendation: heroesFeature.loadHeroCatalogForRecommendation,
    loadHeroes: heroesFeature.loadHeroes,
    runWithButtonLoading,
    setNotice,
    state,
    t: (...args) => i18nFeature?.t(...args),
    getLanguage: () => i18nFeature?.getLanguage() || "lv",
  });

  navigationFeature.wireNavigation();
  authFeature.wireAuth();
  heroesFeature.wireHeroes();
  recommendationsFeature.wireRecommendations();
  statsFeature.wireStats();
  adminFeature.wireAdmin();
  i18nFeature.wireLanguageSwitcher({
    onLanguageChanged: () => {
      if (currentUserInfo) {
        currentUserInfo.textContent = getCurrentUserLabel();
      }
      heroesFeature?.rerenderHeroes();
      heroesFeature?.renderTeamSelections();
      heroesFeature?.renderHeroPickerList();
      statsFeature?.rerenderStats?.();
      profileFeature?.renderProfileViewState();
    },
  });
  heroesFeature.renderTeamSelections();

  const savedView = localStorage.getItem(ACTIVE_VIEW_KEY) || DEFAULT_VIEW_ID;
  state.profilePage = profileFeature.normalizeProfilePage(localStorage.getItem(PROFILE_PAGE_KEY));
  await restoreSession();
  navigationFeature.activateView(savedView, { persist: false });
  void statsFeature.loadStatsData();
  i18nFeature.applyTranslations();

  try {
    await Promise.all([heroesFeature.loadHeroes(), heroesFeature.loadHeroCatalogForRecommendation()]);
  } catch (error) {
    setNotice(error.message);
  } finally {
    state.isBootstrapping = false;
  }
}

bootstrap();
