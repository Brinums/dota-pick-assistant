export function createAuthFeature({
  activateView,
  apiRequest,
  attachFieldClearHandlers,
  clearInvalidFields,
  DEFAULT_VIEW_ID,
  markFieldInvalid,
  parseBackendField,
  renderProfileViewState,
  runWithButtonLoading,
  scrollToProfileTabs,
  setNotice,
  setProfilePage,
  setUser,
  state,
  syncAccessUi,
  toValidationError,
  updateToken,
  validateEmail,
  validatePassword,
  validateUsername,
  t = null,
}) {
  const translate = (key, fallback) => (typeof t === "function" ? t(key, fallback) : fallback);

  function resetPasswordVisibility(root = document) {
    root.querySelectorAll("button[data-toggle-password]").forEach((button) => {
      const targetId = String(button.dataset.targetInput || "");
      const input = targetId ? document.querySelector(`#${targetId}`) : null;
      if (input) {
        input.type = "password";
      }
      button.classList.remove("is-visible");
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", translate("auth.showPassword", "Rādīt paroli"));
      button.setAttribute("title", translate("auth.showPassword", "Rādīt paroli"));
    });
  }

  function resetAuthForms() {
    const loginForm = document.querySelector("#loginForm");
    const registerForm = document.querySelector("#registerForm");

    loginForm?.reset();
    registerForm?.reset();

    if (loginForm) {
      clearInvalidFields(loginForm);
    }
    if (registerForm) {
      clearInvalidFields(registerForm);
    }

    resetPasswordVisibility(document);
  }

  function openAuthPanel() {
    resetAuthForms();
    activateView("loginView");
  }

  function openRegisterPanel() {
    resetAuthForms();
    activateView("registerView");
  }

  function closeAuthPanels() {
    // No auth modals anymore.
  }

  function wireAuth() {
    const registerForm = document.querySelector("#registerForm");
    const loginForm = document.querySelector("#loginForm");
    const profileUsernameForm = document.querySelector("#profileUsernameForm");
    const profileEmailForm = document.querySelector("#profileEmailForm");
    const changePasswordForm = document.querySelector("#changePasswordForm");
    const profileEditUsernameBtn = document.querySelector("#profileEditUsernameBtn");
    const profileEditEmailBtn = document.querySelector("#profileEditEmailBtn");
    const profileEditPasswordBtn = document.querySelector("#profileEditPasswordBtn");
    const profileBackFromUsernameBtn = document.querySelector("#profileBackFromUsernameBtn");
    const profileBackFromEmailBtn = document.querySelector("#profileBackFromEmailBtn");
    const profileBackFromPasswordBtn = document.querySelector("#profileBackFromPasswordBtn");
    const logoutBtn = document.querySelector("#logoutBtn");
    const openRegisterPanelBtn = document.querySelector("#openRegisterPanelBtn");
    const backToLoginBtn = document.querySelector("#backToLoginBtn");
    const passwordToggleButtons = document.querySelectorAll("button[data-toggle-password]");

    [registerForm, loginForm, profileUsernameForm, profileEmailForm, changePasswordForm].forEach((form) => {
      attachFieldClearHandlers(form);
    });

    passwordToggleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const targetId = String(button.dataset.targetInput || "");
        const input = targetId ? document.querySelector(`#${targetId}`) : null;
        if (!input) {
          return;
        }

        const shouldShowPassword = input.type === "password";
        input.type = shouldShowPassword ? "text" : "password";
        button.classList.toggle("is-visible", shouldShowPassword);
        button.setAttribute("aria-pressed", shouldShowPassword ? "true" : "false");
        button.setAttribute(
          "aria-label",
          shouldShowPassword
            ? translate("auth.hidePassword", "Paslēpt paroli")
            : translate("auth.showPassword", "Rādīt paroli"),
        );
        button.setAttribute(
          "title",
          shouldShowPassword
            ? translate("auth.hidePassword", "Paslēpt paroli")
            : translate("auth.showPassword", "Rādīt paroli"),
        );
      });
    });

    openRegisterPanelBtn?.addEventListener("click", () => {
      openRegisterPanel();
    });

    backToLoginBtn?.addEventListener("click", () => {
      openAuthPanel();
    });

    profileEditUsernameBtn?.addEventListener("click", () => {
      if (!state.token) {
        openAuthPanel();
        setNotice("Vispirms jāpieslēdzas sistēmai.");
        return;
      }

      renderProfileViewState();
      clearInvalidFields(profileUsernameForm || document);
      setProfilePage("username");
      scrollToProfileTabs();
    });

    profileEditEmailBtn?.addEventListener("click", () => {
      if (!state.token) {
        setNotice("Vispirms jāpieslēdzas sistēmai.");
        return;
      }

      renderProfileViewState();
      clearInvalidFields(profileEmailForm || document);
      setProfilePage("email");
      scrollToProfileTabs();
    });

    profileEditPasswordBtn?.addEventListener("click", () => {
      if (!state.token) {
        setNotice("Vispirms jāpieslēdzas sistēmai.");
        return;
      }

      changePasswordForm?.reset();
      clearInvalidFields(changePasswordForm || document);
      resetPasswordVisibility(changePasswordForm || document);
      setProfilePage("password");
      scrollToProfileTabs();
    });

    profileBackFromUsernameBtn?.addEventListener("click", () => {
      renderProfileViewState();
      clearInvalidFields(profileUsernameForm || document);
      setProfilePage("overview");
    });

    profileBackFromEmailBtn?.addEventListener("click", () => {
      renderProfileViewState();
      clearInvalidFields(profileEmailForm || document);
      setProfilePage("overview");
    });

    profileBackFromPasswordBtn?.addEventListener("click", () => {
      changePasswordForm?.reset();
      clearInvalidFields(changePasswordForm || document);
      resetPasswordVisibility(changePasswordForm || document);
      setProfilePage("overview");
    });

    registerForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearInvalidFields(registerForm);

      const formData = new FormData(registerForm);
      const username = String(formData.get("username") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const password = String(formData.get("password") || "");
      const passwordConfirm = String(formData.get("passwordConfirm") || "");

      await runWithButtonLoading(registerForm.querySelector("button[type='submit']"), "Reģistrē...", async () => {
        try {
          const usernameError = validateUsername(username);
          if (usernameError) {
            throw usernameError;
          }

          const emailError = validateEmail(email);
          if (emailError) {
            throw emailError;
          }

          const passwordError = validatePassword(password, "password");
          if (passwordError) {
            throw passwordError;
          }

          if (!passwordConfirm) {
            throw toValidationError("Ievadi paroles apstiprinājumu.", "passwordConfirm");
          }

          if (password !== passwordConfirm) {
            throw toValidationError("Paroles nesakrīt.", "passwordConfirm");
          }

          const result = await apiRequest("/auth/register", {
            method: "POST",
            body: { username, email, password },
          });
          updateToken(result.token);
          setUser(result.user);
          resetAuthForms();
          activateView(DEFAULT_VIEW_ID);
          setNotice("Reģistrācija veiksmīga.", "success");
        } catch (error) {
          const fieldName = parseBackendField(error, {
            username: "username",
            email: "email",
            password: "password",
          });
          if (fieldName) {
            markFieldInvalid(registerForm, fieldName);
          } else if (error?.field) {
            markFieldInvalid(registerForm, error.field);
          }
          setNotice(error.message);
        }
      });
    });

    loginForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearInvalidFields(loginForm);

      const formData = new FormData(loginForm);
      const email = String(formData.get("email") || "").trim();
      const password = String(formData.get("password") || "");

      await runWithButtonLoading(loginForm.querySelector("button[type='submit']"), "Ienāk...", async () => {
        try {
          const emailError = validateEmail(email);
          if (emailError) {
            throw emailError;
          }

          if (!password) {
            throw toValidationError("Ievadi paroli.", "password");
          }

          const result = await apiRequest("/auth/login", {
            method: "POST",
            body: { email, password },
          });
          updateToken(result.token);
          setUser(result.user);
          resetAuthForms();
          activateView(DEFAULT_VIEW_ID);
          setNotice("Pieslēgšanās veiksmīga.", "success");
        } catch (error) {
          if (error?.field) {
            markFieldInvalid(loginForm, error.field);
          } else {
            markFieldInvalid(loginForm, "email");
            markFieldInvalid(loginForm, "password");
          }
          setNotice(error.message);
        }
      });
    });

    profileUsernameForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!state.token) {
        setNotice("Vispirms jāpieslēdzas sistēmai.");
        return;
      }
      clearInvalidFields(profileUsernameForm);

      const formData = new FormData(profileUsernameForm);
      const username = String(formData.get("username") || "").trim();

      await runWithButtonLoading(
        profileUsernameForm.querySelector("button[type='submit']"),
        "Saglabā...",
        async () => {
          try {
            const usernameError = validateUsername(username);
            if (usernameError) {
              throw usernameError;
            }

            const result = await apiRequest("/users/me/profile", {
              method: "PATCH",
              auth: true,
              body: { username },
            });
            setUser(result.data, { closePanels: false });
            setProfilePage("overview");
            setNotice("Lietotājvārds atjaunināts.", "success");
          } catch (error) {
            const fieldName = parseBackendField(error, { username: "username" }) || error?.field;
            if (fieldName) {
              markFieldInvalid(profileUsernameForm, fieldName);
            }
            setNotice(error.message);
          }
        },
      );
    });

    profileEmailForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!state.token) {
        setNotice("Vispirms jāpieslēdzas sistēmai.");
        return;
      }
      clearInvalidFields(profileEmailForm);

      const formData = new FormData(profileEmailForm);
      const email = String(formData.get("email") || "").trim();

      await runWithButtonLoading(profileEmailForm.querySelector("button[type='submit']"), "Saglabā...", async () => {
        try {
          const emailError = validateEmail(email);
          if (emailError) {
            throw emailError;
          }

          const result = await apiRequest("/users/me/profile", {
            method: "PATCH",
            auth: true,
            body: { email },
          });
          setUser(result.data, { closePanels: false });
          setProfilePage("overview");
          setNotice("E-pasts atjaunināts.", "success");
        } catch (error) {
          const fieldName = parseBackendField(error, { email: "email" }) || error?.field;
          if (fieldName) {
            markFieldInvalid(profileEmailForm, fieldName);
          }
          setNotice(error.message);
        }
      });
    });

    changePasswordForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!state.token) {
        setNotice("Vispirms jāpieslēdzas sistēmai.");
        return;
      }
      clearInvalidFields(changePasswordForm);

      const formData = new FormData(changePasswordForm);
      const currentPassword = String(formData.get("currentPassword") || "");
      const newPassword = String(formData.get("newPassword") || "");
      const newPasswordConfirm = String(formData.get("newPasswordConfirm") || "");

      await runWithButtonLoading(
        changePasswordForm.querySelector("button[type='submit']"),
        "Atjaunina...",
        async () => {
          try {
            if (!currentPassword) {
              throw toValidationError("Ievadi esošo paroli.", "currentPassword");
            }

            const passwordError = validatePassword(newPassword, "newPassword");
            if (passwordError) {
              throw passwordError;
            }

            if (!newPasswordConfirm) {
              throw toValidationError("Ievadi jaunās paroles apstiprinājumu.", "newPasswordConfirm");
            }

            if (newPassword !== newPasswordConfirm) {
              throw toValidationError("Jaunā parole un apstiprinājums nesakrīt.", "newPasswordConfirm");
            }

            await apiRequest("/users/me/password", {
              method: "PATCH",
              auth: true,
              body: { currentPassword, newPassword },
            });
            changePasswordForm.reset();
            resetPasswordVisibility(changePasswordForm);
            setProfilePage("overview");
            setNotice("Parole veiksmīgi nomainīta.", "success");
          } catch (error) {
            const fieldName =
              parseBackendField(error, { currentPassword: "currentPassword", newPassword: "newPassword" }) ||
              error?.field;
            if (fieldName) {
              markFieldInvalid(changePasswordForm, fieldName);
            } else if (String(error?.message || "").toLowerCase().includes("current password")) {
              markFieldInvalid(changePasswordForm, "currentPassword");
            }
            setNotice(error.message);
          }
        },
      );
    });

    logoutBtn?.addEventListener("click", () => {
      updateToken("");
      setUser(null);
      activateView(DEFAULT_VIEW_ID);
      setNotice("Sesija beigusies.", "success");
    });

    renderProfileViewState();
    setProfilePage(state.profilePage, { persist: false });
    syncAccessUi();
  }

  return {
    closeAuthPanels,
    openAuthPanel,
    openRegisterPanel,
    resetAuthForms,
    wireAuth,
  };
}
