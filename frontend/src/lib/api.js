import { getTokens, setTokens, clearTokens } from "../auth/tokenStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function refreshAccessToken() {
  const { refreshToken } = getTokens();
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.tokens?.accessToken) return null;

  setTokens({ accessToken: data.tokens.accessToken, refreshToken: data.tokens.refreshToken });
  return data.tokens.accessToken;
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

  const res = await fetch(url, { method, headers, body: fetchBody });

  if (res.status === 401 && !_retry) {
    const newAccess = await refreshAccessToken();
    if (!newAccess) {
      clearTokens();
      throw new Error("Session expired. Please login again.");
    }
    return apiFetch(path, { method, body, formData }, true);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || `Request failed with ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export function apiBaseUrl() {
  return API_BASE_URL;
}

