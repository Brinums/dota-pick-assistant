export function createNavigationFeature({
  ACTIVE_VIEW_KEY,
  DEFAULT_VIEW_ID,
  onCloseAuthPanels,
  onCloseHeroPicker,
  onLoadStatsData,
  onOpenAuthPanel,
  onSetProfilePage,
  setNotice,
  state,
}) {
  function normalizeViewId(viewId) {
    const allowedViews = new Set(
      [...document.querySelectorAll(".view")]
        .map((view) => view.id)
        .filter((value) => typeof value === "string" && value.trim().length > 0),
    );

    let targetView = allowedViews.has(viewId) ? viewId : DEFAULT_VIEW_ID;

    if (targetView === "recommendView" && !state.user) {
      targetView = DEFAULT_VIEW_ID;
    }

    if (targetView === "profileView" && !state.user) {
      targetView = DEFAULT_VIEW_ID;
    }

    if (targetView === "adminView" && state.user?.role !== "ADMIN") {
      targetView = DEFAULT_VIEW_ID;
    }

    if (["loginView", "registerView"].includes(targetView) && state.user) {
      targetView = DEFAULT_VIEW_ID;
    }

    return targetView;
  }

  function activateView(viewId, { persist = true, resetProfilePage = false } = {}) {
    const targetView = normalizeViewId(viewId);

    onCloseHeroPicker?.();
    onCloseAuthPanels?.();
    setNotice("");

    document.querySelectorAll(".view").forEach((view) => {
      view.classList.toggle("active", view.id === targetView);
    });

    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.view === targetView);
    });

    if (persist) {
      localStorage.setItem(ACTIVE_VIEW_KEY, targetView);
    }

    if (targetView === "profileView") {
      if (resetProfilePage) {
        onSetProfilePage?.("overview");
      } else {
        onSetProfilePage?.(state.profilePage, { persist: false });
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const contentRoot = document.querySelector(".content");
    if (contentRoot) {
      contentRoot.scrollTop = 0;
    }

    if (targetView === "statsView") {
      void onLoadStatsData?.();
    }
  }

  function wireNavigation() {
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.view;
        if (!target) {
          return;
        }
        const shouldResetProfilePage = target === "profileView";
        activateView(target, { resetProfilePage: shouldResetProfilePage });
      });
    });

    document.querySelectorAll(".nav-jump-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.jumpView;
        if (!target) {
          return;
        }

        if (target === "recommendView" && !state.user) {
          onOpenAuthPanel?.();
          setNotice("Lai izmantotu ieteikumus, vispirms jāpieslēdzas sistēmai.");
          return;
        }

        activateView(target);
      });
    });
  }

  return {
    activateView,
    normalizeViewId,
    wireNavigation,
  };
}
