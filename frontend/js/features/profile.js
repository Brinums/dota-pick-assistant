export function createProfileFeature({ PROFILE_PAGE_KEY, PROFILE_PAGES, state, t = null }) {
  function normalizeProfilePage(page) {
    const key = String(page || "").trim();
    return Object.prototype.hasOwnProperty.call(PROFILE_PAGES, key) ? key : "overview";
  }

  function setProfilePage(page = "overview", { persist = true } = {}) {
    const targetPage = normalizeProfilePage(page);
    state.profilePage = targetPage;

    if (persist) {
      localStorage.setItem(PROFILE_PAGE_KEY, targetPage);
    }

    Object.entries(PROFILE_PAGES).forEach(([key, elementId]) => {
      const pageElement = document.querySelector(`#${elementId}`);
      if (!pageElement) {
        return;
      }
      const isActive = key === targetPage;
      pageElement.hidden = !isActive;
      pageElement.classList.toggle("active", isActive);
    });
  }

  function scrollToProfileTabs() {
    const activePage = document.querySelector(".profile-page.active") || document.querySelector("#profileOverviewPage");
    activePage?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function renderProfileViewState() {
    const profileInfo = document.querySelector("#authProfileCurrentInfo");
    const profileUsernameForm = document.querySelector("#profileUsernameForm");
    const profileEmailForm = document.querySelector("#profileEmailForm");
    const changePasswordForm = document.querySelector("#changePasswordForm");
    const profileUsernameValue = document.querySelector("#profileUsernameValue");
    const profileEmailValue = document.querySelector("#profileEmailValue");
    const isAuthenticated = Boolean(state.user);

    if (profileInfo) {
      if (!isAuthenticated) {
        profileInfo.textContent = typeof t === "function" ? t("profile.noSession", "Nav aktīvas sesijas.") : "Nav aktīvas sesijas.";
      } else {
        const normalizedRole = String(state.user.role || "").trim().toUpperCase();
        const roleLabel =
          normalizedRole === "ADMIN"
            ? typeof t === "function"
              ? t("role.admin", "Admin")
              : "Admin"
            : normalizedRole === "USER"
              ? typeof t === "function"
                ? t("role.user", "User")
                : "User"
              : normalizedRole;
        const username = state.user.username ? `@${state.user.username}` : "";
        profileInfo.textContent = `${state.user.email} ${username} · ${roleLabel}`;
      }
    }

    if (profileUsernameValue) {
      profileUsernameValue.textContent = isAuthenticated ? state.user.username || "-" : "-";
    }

    if (profileEmailValue) {
      profileEmailValue.textContent = isAuthenticated ? state.user.email || "-" : "-";
    }

    if (profileUsernameForm) {
      const usernameInput = profileUsernameForm.querySelector('input[name="username"]');

      if (isAuthenticated) {
        if (usernameInput) {
          usernameInput.value = state.user.username || "";
        }
      } else {
        profileUsernameForm.reset();
        setProfilePage("overview");
      }
    }

    if (profileEmailForm) {
      const emailInput = profileEmailForm.querySelector('input[name="email"]');

      if (isAuthenticated) {
        if (emailInput) {
          emailInput.value = state.user.email || "";
        }
      } else {
        profileEmailForm.reset();
        setProfilePage("overview");
      }
    }

    if (!isAuthenticated && changePasswordForm) {
      changePasswordForm.reset();
    }
  }

  return {
    normalizeProfilePage,
    renderProfileViewState,
    scrollToProfileTabs,
    setProfilePage,
  };
}
