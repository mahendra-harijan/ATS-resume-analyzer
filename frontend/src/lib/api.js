import { getTokens, setTokens, clearTokens } from "../auth/tokenStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export class ApiError extends Error {
  constructor(message, { status, code, details, url, method } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
    this.method = method;
  }
}

export function isApiError(err) {
  return err instanceof ApiError || err?.name === "ApiError";
}

function emitGlobalError({ title, message, details, status, code, url, method }) {
  if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") return;
  try {
    window.dispatchEvent(
      new CustomEvent("app:global-error", {
        detail: { title, message, details, status, code, url, method },
      })
    );
  } catch {
    // no-op
  }
}

async function readResponseBody(res) {
  const ct = res.headers?.get("content-type") || "";
  if (ct.includes("application/json")) {
    const data = await res.json().catch(() => ({}));
    return { kind: "json", data };
  }

  const text = await res.text().catch(() => "");
  return { kind: "text", data: text };
}

async function refreshAccessToken() {
  const { refreshToken } = getTokens();
  if (!refreshToken) return null;

  let res;
  try {
    res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return null;
  }

  const body = await readResponseBody(res);
  const data = body.kind === "json" ? body.data : {};
  if (!res.ok || !data?.tokens?.accessToken) return null;

  setTokens({ accessToken: data.tokens.accessToken, refreshToken: data.tokens.refreshToken });
  return data.tokens.accessToken;
}

function isAuthPath(path) {
  const p = String(path || "");
  return p.startsWith("/api/auth/");
}

export async function apiFetch(path, { method = "GET", body, formData = null } = {}, _retry = false) {
  const { accessToken } = getTokens();

  const url = `${API_BASE_URL}${path}`;
  const headers = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let fetchBody = body;
  if (formData) {
    fetchBody = formData;
  } else if (body && !(body instanceof FormData) && !(body instanceof Blob)) {
    headers["Content-Type"] = "application/json";
    fetchBody = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, { method, headers, body: fetchBody });
  } catch (e) {
    const err = new ApiError("Network error. Please check your connection.", {
      status: 0,
      code: "NETWORK_ERROR",
      details: import.meta.env.DEV ? (e?.message || String(e)) : undefined,
      url,
      method,
    });
    emitGlobalError({
      title: "Cannot reach server",
      message: err.message,
      details: err.details,
      status: err.status,
      code: err.code,
      url,
      method,
    });
    throw err;
  }

  // Only attempt refresh-token flow for non-auth routes.
  // Login/signup should surface their real 401/404 messages.
  if (res.status === 401 && !_retry && accessToken && !isAuthPath(path)) {
    const newAccess = await refreshAccessToken();
    if (!newAccess) {
      clearTokens();
      throw new ApiError("Session expired. Please login again.", {
        status: 401,
        code: "SESSION_EXPIRED",
        url,
        method,
      });
    }
    return apiFetch(path, { method, body, formData }, true);
  }

  const bodyData = await readResponseBody(res);
  const data = bodyData.kind === "json" ? bodyData.data : {};

  if (!res.ok) {
    const message =
      (bodyData.kind === "json" && data?.message) ||
      (bodyData.kind === "text" && String(bodyData.data || "").trim()) ||
      `Request failed with ${res.status}`;

    const err = new ApiError(message, {
      status: res.status,
      code: data?.code,
      details: data?.details,
      url,
      method,
    });

    // Backend-down scenarios: show the global error page.
    // (Keep other 5xx errors as inline page errors.)
    if (err.status === 503) {
      emitGlobalError({
        title: "Service unavailable",
        message: err.message,
        details: import.meta.env.DEV ? (JSON.stringify(err.details ?? data ?? {}, null, 2) || "") : "",
        status: err.status,
        code: err.code,
        url,
        method,
      });
    }

    throw err;
  }

  return bodyData.kind === "json" ? data : { success: true, data: bodyData.data };
}

export function apiBaseUrl() {
  return API_BASE_URL;
}

