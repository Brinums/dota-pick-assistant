export const state = {
  token: localStorage.getItem("dpa_token") || "",
  language: localStorage.getItem("dpa_language") || "lv",
  user: null,
  isBootstrapping: true,
  profilePage: localStorage.getItem("dpa_profile_page") || "overview",
  heroCatalog: [],
  selectedAllies: [],
  selectedEnemies: [],
  pickerTarget: null,
  statsLoaded: false,
  statsLoading: false,
  statsData: null,
  statsSortKey: "winRate",
  statsWinrateOrder: "desc",
};

export const API_REQUEST_TIMEOUT_MS = 6000;
export const RECOMMENDATION_REQUEST_TIMEOUT_MS = 20000;
export const HERO_SYNC_REQUEST_TIMEOUT_MS = 90000;
export const API_BASE = "https://dota-pick-assistant-production.up.railway.app/api";
export const ACTIVE_VIEW_KEY = "dpa_active_view";
export const PROFILE_PAGE_KEY = "dpa_profile_page";
export const LANGUAGE_KEY = "dpa_language";
export const DEFAULT_LANGUAGE = "lv";
export const DEFAULT_VIEW_ID = "homeView";

export const PROFILE_PAGES = {
  overview: "profileOverviewPage",
  username: "profileUsernamePage",
  email: "profileEmailPage",
  password: "profilePasswordPage",
};

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const USERNAME_REGEX = /^[A-Za-z0-9_.-]+$/;
