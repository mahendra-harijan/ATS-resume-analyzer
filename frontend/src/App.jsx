import { useEffect, useMemo, useState } from "react";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import PreviousAnalyses from "./pages/PreviousAnalyses";
import ResumeGenerator from "./pages/ResumeGenerator";

import AppHeader from "./components/AppHeader";
import AppFooter from "./components/AppFooter";

import { apiFetch } from "./lib/api";
import { clearTokens, getTokens, setTokens } from "./auth/tokenStore";

function routeFromHash() {
  const h = (window.location.hash || "").replace(/^#\/?/, "");
  return h.trim() || "landing";
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export default function App() {
  const [route, setRoute] = useState(routeFromHash());
  const [accessToken, setAccessToken] = useState(() => getTokens().accessToken);
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
      setRoute(routeFromHash());
      setAccessToken(getTokens().accessToken);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const isAuthed = useMemo(() => Boolean(accessToken), [accessToken]);

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
    if ((route === "dashboard" || route === "history" || route === "resume-generator") && !isAuthed) go("/login");
  }, [route, isAuthed]);

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
        {route === "landing" && <Landing onLogin={() => go("/login")} onSignup={() => go("/signup")} />}
        {route === "login" && <Login onLogin={handleLogin} onGoSignup={() => go("/signup")} />}
        {route === "signup" && <Signup onSignup={handleSignup} onGoLogin={() => go("/login")} />}
        {route === "dashboard" && <Dashboard />}
        {route === "history" && <PreviousAnalyses />}
        {route === "resume-generator" && <ResumeGenerator />}
      </main>

      <AppFooter />
    </div>
  );
}
