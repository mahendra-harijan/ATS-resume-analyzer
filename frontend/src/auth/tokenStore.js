const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export function getTokens() {
  return {
    accessToken: window.localStorage.getItem(ACCESS_KEY),
    refreshToken: window.localStorage.getItem(REFRESH_KEY),
  };
}

export function setTokens({ accessToken, refreshToken }) {
  if (accessToken) window.localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) window.localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}

