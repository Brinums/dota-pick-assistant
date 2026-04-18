import { API_BASE, API_REQUEST_TIMEOUT_MS, state } from "./config.js";

export async function apiRequest(
  path,
  { method = "GET", body, auth = false, timeoutMs = API_REQUEST_TIMEOUT_MS } = {},
) {
  const headers = { "Content-Type": "application/json" };
  if (auth && state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const effectiveTimeout = Number.isFinite(Number(timeoutMs))
    ? Math.max(1000, Number(timeoutMs))
    : API_REQUEST_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), effectiveTimeout);
  const fetchPromise = fetch(`${API_BASE}${path}`, {
    method,
    headers,
    signal: controller.signal,
    body: body ? JSON.stringify(body) : undefined,
  });

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("BACKEND_TIMEOUT"));
    }, effectiveTimeout);
  });

  let response;
  try {
    response = await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    if (error?.message === "BACKEND_TIMEOUT" || error?.name === "AbortError") {
      controller.abort();
      throw new Error("Backend atbild pārāk ilgi. Pārbaudi vai serveris darbojas un mēģini vēlreiz.");
    }
    throw new Error("Neizdevās pieslēgties backend API. Pārbaudi vai serveris darbojas un CORS ir pareizs.");
  } finally {
    clearTimeout(timeoutId);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || `HTTP ${response.status}`;
    const error = new Error(message);
    if (Array.isArray(data?.errors)) {
      error.errors = data.errors;
    }
    error.status = response.status;
    throw error;
  }

  return data;
}
