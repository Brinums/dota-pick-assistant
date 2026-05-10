import { API_BASE, EMAIL_REGEX, USERNAME_REGEX, state } from "./config.js";

export function toTitleCase(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function shortHeroNameFromRaw(rawName) {
  return String(rawName || "")
    .replace(/^npc_dota_hero_/, "")
    .trim();
}

export function slugifyHeroName(localizedName) {
  return String(localizedName || "")
    .trim()
    .toLowerCase()
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

const HERO_IMAGE_NAME_OVERRIDES = {
  "anti-mage": "antimage",
  "clockwerk": "rattletrap",
  "doom": "doom_bringer",
  "io": "wisp",
  "nature's prophet": "furion",
  "necrophos": "necrolyte",
  "outworld destroyer": "obsidian_destroyer",
  "queen of pain": "queenofpain",
  "shadow fiend": "nevermore",
  "timbersaw": "shredder",
  "treant protector": "treant",
  "underlord": "abyssal_underlord",
  "vengeful spirit": "vengefulspirit",
  "windranger": "windrunner",
  "wraith king": "skeleton_king",
};

export function getHeroImageUrlByNameOrId(hero) {
  if (!hero) {
    return "";
  }

  let shortName = shortHeroNameFromRaw(hero.name);
  const idCandidates = [
    Number(hero.id),
    Number(hero.heroId),
    Number(hero.valveId),
    Number(hero.suggestedHeroId),
  ].filter((value) => Number.isFinite(value) && value > 0);

  const normalizedLocalizedName = String(hero.localizedName || "")
    .trim()
    .toLowerCase();

  if (!shortName) {
    const fromCatalog = state.heroCatalog.find((item) => {
      if (idCandidates.length) {
        const itemId = Number(item.id);
        const itemValveId = Number(item.valveId);
        if (idCandidates.includes(itemId) || idCandidates.includes(itemValveId)) {
          return true;
        }
      }

      if (!normalizedLocalizedName) {
        return false;
      }

      const itemLocalizedName = String(item.localizedName || "")
        .trim()
        .toLowerCase();
      return itemLocalizedName === normalizedLocalizedName;
    });

    shortName = shortHeroNameFromRaw(fromCatalog?.name);
  }

  if (!shortName) {
    shortName = HERO_IMAGE_NAME_OVERRIDES[normalizedLocalizedName] || slugifyHeroName(hero.localizedName);
  }

  if (!shortName) {
    return "";
  }

  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${shortName}.png`;
}

export function compactRoleBadges(roles) {
  if (!Array.isArray(roles) || !roles.length) {
    return "<span class='section-help'>-</span>";
  }

  return roles
    .slice(0, 4)
    .map((role) => `<span class=\"role-badge\">${toTitleCase(role)}</span>`)
    .join("");
}

export function getApiBase() {
  return API_BASE;
}

export function clearInvalidFields(root = document) {
  root.querySelectorAll(".is-invalid").forEach((field) => {
    field.classList.remove("is-invalid");
  });
}

export function markFieldInvalid(form, fieldName) {
  if (!form || !fieldName) {
    return null;
  }

  const field = form.querySelector(`[name=\"${fieldName}\"]`);
  if (field) {
    field.classList.add("is-invalid");
  }

  return field || null;
}

export function toValidationError(message, field = "") {
  const error = new Error(message);
  error.field = field;
  return error;
}

export function parseBackendField(error, fieldMap = {}) {
  if (error?.field) {
    return error.field;
  }

  if (Array.isArray(error?.errors)) {
    for (const issue of error.errors) {
      const path = Array.isArray(issue?.path) ? issue.path : [];
      const rawField = String(path[path.length - 1] || "").trim();
      if (!rawField) {
        continue;
      }
      return fieldMap[rawField] || rawField;
    }
  }

  return "";
}

export function attachFieldClearHandlers(form) {
  if (!form) {
    return;
  }

  form.querySelectorAll("input, select, textarea").forEach((field) => {
    const clear = () => field.classList.remove("is-invalid");
    field.addEventListener("input", clear);
    field.addEventListener("change", clear);
  });
}

export function validateUsername(username) {
  const normalized = String(username || "").trim();
  if (!normalized) {
    return toValidationError("Ievadi lietotājvārdu.", "username");
  }
  if (normalized.length < 3 || normalized.length > 30) {
    return toValidationError("Lietotājvārdam jābūt 3 līdz 30 simbolu garam.", "username");
  }
  if (!USERNAME_REGEX.test(normalized)) {
    return toValidationError("Lietotājvārds drīkst saturēt tikai burtus, ciparus, _, . un -.", "username");
  }
  return null;
}

export function validateEmail(email) {
  const normalized = String(email || "").trim();
  if (!normalized) {
    return toValidationError("Ievadi e-pastu.", "email");
  }
  if (!EMAIL_REGEX.test(normalized)) {
    return toValidationError("Ievadi korektu e-pastu.", "email");
  }
  return null;
}

export function validatePassword(password, field = "password") {
  const value = String(password || "");
  if (value.length < 8) {
    return toValidationError("Parolei jābūt vismaz 8 simboliem.", field);
  }
  if (!/[A-Z]/.test(value)) {
    return toValidationError("Parolē jābūt vismaz vienam lielajam burtam.", field);
  }
  if (!/[a-z]/.test(value)) {
    return toValidationError("Parolē jābūt vismaz vienam mazajam burtam.", field);
  }
  if (!/[0-9]/.test(value)) {
    return toValidationError("Parolē jābūt vismaz vienam ciparam.", field);
  }
  if (!/[^A-Za-z0-9]/.test(value)) {
    return toValidationError("Parolē jābūt vismaz vienam speciālajam simbolam.", field);
  }
  return null;
}

export function setButtonLoading(button, isLoading, loadingLabel = "Ielādē...") {
  if (!button) {
    return;
  }

  if (isLoading) {
    if (!button.dataset.originalLabel) {
      button.dataset.originalLabel = button.textContent || "";
    }
    button.textContent = loadingLabel;
    button.disabled = true;
    button.classList.add("is-loading");
    return;
  }

  const originalLabel = button.dataset.originalLabel;
  if (typeof originalLabel === "string") {
    button.textContent = originalLabel;
    delete button.dataset.originalLabel;
  }
  button.disabled = false;
  button.classList.remove("is-loading");
}

export async function runWithButtonLoading(button, loadingLabel, job) {
  setButtonLoading(button, true, loadingLabel);
  try {
    return await job();
  } finally {
    setButtonLoading(button, false);
  }
}

export function formatPrimaryAttr(value, { short = true } = {}) {
  const key = String(value || "").toLowerCase();
  const mapping = {
    str: { short: "STR", full: "Strength" },
    agi: { short: "AGI", full: "Agility" },
    int: { short: "INT", full: "Intelligence" },
    all: { short: "UNI", full: "Universal" },
  };

  const resolved = mapping[key];
  if (!resolved) {
    return value ? String(value).toUpperCase() : "-";
  }

  return short ? resolved.short : resolved.full;
}
