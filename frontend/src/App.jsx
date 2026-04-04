import { useEffect, useMemo, useState } from "react";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import PreviousAnalyses from "./pages/PreviousAnalyses";
import ResumeGenerator from "./pages/ResumeGenerator";
import ErrorPage from "./pages/ErrorPage";

import AppHeader from "./components/AppHeader";
import AppFooter from "./components/AppFooter";

import { apiFetch } from "./lib/api";
import { clearTokens, getTokens, setTokens } from "./auth/tokenStore";

function routeFromLocation() {
  const h = (window.location.hash || "").replace(/^#\/?/, "").trim();
  if (h) return h;

  const rawPath = String(window.location.pathname || "");
  const cleaned = rawPath.replace(/^\/+/, "").replace(/\/+$/, "").trim();
  return cleaned || "landing";
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export default function App() {
  const [route, setRoute] = useState(routeFromLocation());
  const [accessToken, setAccessToken] = useState(() => getTokens().accessToken);
  const [globalError, setGlobalError] = useState(null);
  const [theme, setTheme] = useState(() => {
    const stored = window.localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const onHash = () => {
      setRoute(routeFromLocation());
      setAccessToken(getTokens().accessToken);
      if (routeFromLocation() !== "error") setGlobalError(null);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    function goError(err, title) {
      const msg = err?.message ? String(err.message) : "An unexpected error occurred.";
      const details = import.meta.env.DEV ? (err?.stack || msg) : "";
      setGlobalError({
        title: title || "Unexpected error",
        message: msg,
        details,
      });
      window.location.hash = "/error";
    }

    const onUnhandledRejection = (event) => {
      const reason = event?.reason;
      goError(reason instanceof Error ? reason : new Error(String(reason || "Unhandled promise rejection")), "Unhandled error");
    };

    const onWindowError = (event) => {
      const e = event?.error;
      goError(e instanceof Error ? e : new Error(String(event?.message || "Window error")), "Unexpected error");
    };

    const onGlobalErrorEvent = (event) => {
      const d = event?.detail || {};
      setGlobalError({
        title: d.title || "Something went wrong",
        message: d.message || "An unexpected error occurred.",
        details: d.details || "",
      });
      window.location.hash = "/error";
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("error", onWindowError);
    window.addEventListener("app:global-error", onGlobalErrorEvent);
    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.removeEventListener("error", onWindowError);
      window.removeEventListener("app:global-error", onGlobalErrorEvent);
    };
  }, []);

  const isAuthed = useMemo(() => Boolean(accessToken), [accessToken]);

  const resolvedRoute = useMemo(() => {
    const known = new Set(["landing", "login", "signup", "dashboard", "history", "resume-generator", "error"]);
    return known.has(route) ? route : "not-found";
  }, [route]);

  function go(path) {
    window.location.hash = path;
  }

  async function handleLogin({ email, password }) {
    const data = await apiFetch("/api/auth/login", { method: "POST", body: { email, password } });
    setTokens({ accessToken: data.tokens.accessToken, refreshToken: data.tokens.refreshToken });
    setAccessToken(data.tokens.accessToken);
    go("/dashboard");
  }

  async function handleSignup({ name, email, password }) {
    const data = await apiFetch("/api/auth/signup", { method: "POST", body: { name, email, password } });
    setTokens({ accessToken: data.tokens.accessToken, refreshToken: data.tokens.refreshToken });
    setAccessToken(data.tokens.accessToken);
    go("/dashboard");
  }

  function handleLogout() {
    clearTokens();
    setAccessToken(null);
    go("/landing");
  }

  // Protected route enforcement
  useEffect(() => {
    if ((resolvedRoute === "dashboard" || resolvedRoute === "history" || resolvedRoute === "resume-generator") && !isAuthed) go("/login");
  }, [resolvedRoute, isAuthed]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
      <AppHeader
        route={route}
        isAuthed={isAuthed}
        onNavigate={go}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      />

      <main className="flex-1">
        {resolvedRoute === "landing" && <Landing onLogin={() => go("/login")} onSignup={() => go("/signup")} />}
        {resolvedRoute === "login" && <Login onLogin={handleLogin} onGoSignup={() => go("/signup")} />}
        {resolvedRoute === "signup" && <Signup onSignup={handleSignup} onGoLogin={() => go("/login")} />}
        {resolvedRoute === "dashboard" && <Dashboard />}
        {resolvedRoute === "history" && <PreviousAnalyses />}
        {resolvedRoute === "resume-generator" && <ResumeGenerator />}

        {resolvedRoute === "error" && (
          <ErrorPage
            title={globalError?.title || "Something went wrong"}
            message={globalError?.message || "An unexpected error occurred."}
            details={globalError?.details}
            primaryAction={{ label: "Go home", onClick: () => go("/landing") }}
            secondaryAction={{ label: "Reload", onClick: () => window.location.reload() }}
          />
        )}

        {resolvedRoute === "not-found" && (
          <ErrorPage
            title="Page not found"
            message="This page doesn’t exist."
            primaryAction={{ label: "Go home", onClick: () => go("/landing") }}
            secondaryAction={{ label: "Dashboard", onClick: () => go("/dashboard") }}
          />
        )}
      </main>

      <AppFooter />
    </div>
  );
}
