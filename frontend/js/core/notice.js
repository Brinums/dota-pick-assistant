export function createNoticeManager({ noticeEl, translateMessage = null }) {
  const MAX_TOASTS = 3;
  const TOAST_LIFETIME_MS = 4500;
  const stack = document.createElement("div");
  stack.className = "toast-stack";
  document.body.appendChild(stack);

  function removeToast(toast) {
    if (!toast) {
      return;
    }
    toast.classList.add("toast--hide");
    setTimeout(() => {
      toast.remove();
    }, 180);
  }

  function setNotice(message, type = "error") {
    if (!message) {
      if (noticeEl) {
        noticeEl.hidden = true;
        noticeEl.textContent = "";
      }
      return;
    }

    const resolvedMessage =
      typeof translateMessage === "function" ? String(translateMessage(message) || message) : String(message);

    const toast = document.createElement("div");
    toast.className = `toast ${type === "success" ? "toast--success" : "toast--error"}`;
    toast.textContent = resolvedMessage;
    stack.appendChild(toast);

    while (stack.children.length > MAX_TOASTS) {
      removeToast(stack.firstElementChild);
    }

    setTimeout(() => {
      removeToast(toast);
    }, TOAST_LIFETIME_MS);
  }

  return {
    setNotice,
  };
}
