import { useEffect, useState } from "react";

import { apiFetch } from "../lib/api";
import HistoryList from "../components/HistoryList";
import ScoreProgress from "../components/ScoreProgress";
import SectionScores from "../components/SectionScores";
import SectionScorePie from "../components/SectionScorePie";
import KeywordGaps from "../components/KeywordGaps";
import Recommendations from "../components/Recommendations";

function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel, danger = false, busy = false, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={() => {
          if (busy) return;
          onCancel?.();
        }}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl overflow-hidden motion-safe:animate-[fadeIn_160ms_ease-out]"
      >
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-fuchsia-50 dark:from-slate-900 dark:to-slate-900">
          <div className="flex items-start gap-3">
            <div
              className={[
                "mt-0.5 h-9 w-9 rounded-xl flex items-center justify-center border",
                danger
                  ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-200"
                  : "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/20 dark:text-indigo-200",
              ].join(" ")}
            >
              {danger ? (
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm1-11a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0V7Zm-1 8a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 10 15Z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-9.707a1 1 0 0 0-1.414-1.414L9 10.172 7.707 8.879a1 1 0 1 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4Z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>

            <div className="min-w-0">
              <div className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{message}</div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 flex items-center justify-end gap-2 bg-white/70 dark:bg-slate-950/60">
          <button
            type="button"
            disabled={busy}
            onClick={() => onCancel?.()}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 hover:bg-white/80 dark:hover:bg-slate-900/50 text-slate-900 dark:text-white transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:opacity-60"
          >
            {cancelLabel || "Cancel"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onConfirm?.()}
            className={[
              "px-4 py-2 rounded-xl text-white font-semibold transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:opacity-60",
              danger ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700" : "bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700",
            ].join(" ")}
          >
            {busy ? "Deleting..." : confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

function clampScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function variantFromScore(score) {
  const s = clampScore(score);
  if (s >= 80) return "success";
  if (s >= 60) return "warning";
  return "danger";
}

function averageSectionScore(sectionScores) {
  const s = sectionScores || {};
  const values = [s.skills, s.experience, s.education, s.projects, s.keywordsMatch]
    .map(clampScore)
    .filter((n) => Number.isFinite(n));
  if (values.length === 0) return 0;
  return values.reduce((sum, n) => sum + n, 0) / values.length;
}

function variantClasses(variant) {
  if (variant === "success") {
    return {
      wrap: "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/20",
      badge: "bg-emerald-600",
      icon: "text-emerald-700 dark:text-emerald-300",
    };
  }
  if (variant === "danger") {
    return {
      wrap: "border-red-200 bg-red-50/70 dark:border-red-900/60 dark:bg-red-950/20",
      badge: "bg-red-600",
      icon: "text-red-700 dark:text-red-300",
    };
  }
  return {
    wrap: "border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20",
    badge: "bg-amber-600",
    icon: "text-amber-700 dark:text-amber-300",
  };
}

function StatusIcon({ variant }) {
  const cls = variantClasses(variant);
  if (variant === "success") {
    return (
      <svg viewBox="0 0 20 20" className={["h-5 w-5", cls.icon].join(" ")} fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm4.03-11.53a1 1 0 0 0-1.415-1.414L9 8.672 7.884 7.556a1 1 0 1 0-1.414 1.414l1.823 1.823a1 1 0 0 0 1.414 0l4.323-4.323Zm-.323 4.5a1 1 0 0 0-1.414-1.414L9 12.849l-1.116-1.116a1 1 0 1 0-1.414 1.414l1.823 1.823a1 1 0 0 0 1.414 0l4.323-4.323Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (variant === "danger") {
    return (
      <svg viewBox="0 0 20 20" className={["h-5 w-5", cls.icon].join(" ")} fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm2.707-10.707a1 1 0 0 0-1.414-1.414L10 7.586 8.707 6.293a1 1 0 1 0-1.414 1.414L8.586 9l-1.293 1.293a1 1 0 1 0 1.414 1.414L10 10.414l1.293 1.293a1 1 0 0 0 1.414-1.414L11.414 9l1.293-1.293Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" className={["h-5 w-5", cls.icon].join(" ")} fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.72-1.36 3.486 0l6.518 11.59c.75 1.334-.213 2.993-1.742 2.993H3.48c-1.53 0-2.492-1.659-1.742-2.993l6.519-11.59ZM11 14a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-1-7a1 1 0 0 0-1 1v3a1 1 0 1 0 2 0V8a1 1 0 0 0-1-1Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SectionCard({ variant = "warning", title, subtitle, children }) {
  const cls = variantClasses(variant);
  return (
    <section
      className={[
        "rounded-2xl border p-4 transition-transform duration-200 hover:-translate-y-0.5",
        cls.wrap,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={["mt-0.5 h-2.5 w-2.5 rounded-full", cls.badge].join(" ")} />
          <div>
            <div className="flex items-center gap-2">
              <StatusIcon variant={variant} />
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</div>
            </div>
            {subtitle ? <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{subtitle}</div> : null}
          </div>
        </div>
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function PreviousAnalyses() {
  const [historyItems, setHistoryItems] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [result, setResult] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadHistory() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/analysis/history?limit=50", { method: "GET" });
      setHistoryItems(data.items || []);
    } catch (e) {
      setError(e.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  async function selectReport(reportId) {
    setSelectedReportId(reportId);
    setError("");
    try {
      const data = await apiFetch(`/api/analysis/report/${reportId}`, { method: "GET" });
      const r = data?.report;
      if (!r?.result) return;

      setResult({
        overallScore: r.result.overallScore,
        sectionScores: r.result.sectionScores,
        missingKeywords: r.result.missingKeywords,
        recommendations: r.result.recommendations,
        suggestionsToImproveATS: r.result.suggestionsToImproveATS,
        finalRecommendations: r.result.finalRecommendations,
        createdAt: r.createdAt,
      });
    } catch (e) {
      setError(e.message || "Failed to load report");
    }
  }

  function requestDelete(reportId) {
    setConfirmDeleteId(reportId);
  }

  async function confirmDelete() {
    if (!confirmDeleteId) return;

    setDeleting(true);
    setError("");
    try {
      const reportId = confirmDeleteId;
      await apiFetch(`/api/analysis/report/${reportId}`, { method: "DELETE" });
      if (selectedReportId === reportId) {
        setSelectedReportId(null);
        setResult(null);
      }
      setConfirmDeleteId(null);
      await loadHistory();
    } catch (e) {
      setError(e.message || "Failed to delete report");
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="min-h-[100svh]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-2xl font-semibold text-slate-900 dark:text-white">Previous Analyses</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pick a saved report to review.</div>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <HistoryList items={historyItems} selectedId={selectedReportId} onSelect={selectReport} onDelete={requestDelete} />
            {loading && <div className="mt-3 text-sm text-slate-500">Loading history...</div>}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {!result ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 p-6 text-sm text-slate-600 dark:text-slate-300">
                Select an item from the list to view its report.
              </div>
            ) : (
              <div className="space-y-4">
                <SectionCard variant={variantFromScore(result.overallScore)} title="Overall ATS Score" subtitle="Score summary">
                  <ScoreProgress score={result.overallScore} />
                </SectionCard>

                <SectionCard
                  variant={variantFromScore(averageSectionScore(result.sectionScores))}
                  title="Section Score Pie"
                  subtitle="Animated breakdown"
                >
                  <SectionScorePie sectionScores={result.sectionScores} />
                </SectionCard>

                <SectionCard
                  variant={variantFromScore(averageSectionScore(result.sectionScores))}
                  title="Section Scores"
                  subtitle="Horizontal section chips"
                >
                  <SectionScores sectionScores={result.sectionScores} />
                </SectionCard>

                <SectionCard
                  variant={Array.isArray(result.missingKeywords) && result.missingKeywords.length === 0 ? "success" : "danger"}
                  title="Missing Keywords"
                  subtitle="Gaps detected from the job description"
                >
                  <KeywordGaps missingKeywords={result.missingKeywords} />
                </SectionCard>

                <SectionCard variant="warning" title="Recommendations" subtitle="Suggested improvements">
                  <Recommendations recommendations={result.recommendations} />
                </SectionCard>

                {Array.isArray(result.finalRecommendations) && result.finalRecommendations.length > 0 && (
                  <SectionCard variant="warning" title="Final Recommendations" subtitle="High priority">
                    <ul className="space-y-2">
                      {result.finalRecommendations.map((t, idx) => (
                        <li key={idx} className="text-sm text-slate-700 dark:text-slate-300">
                          • {t}
                        </li>
                      ))}
                    </ul>
                  </SectionCard>
                )}

                {Array.isArray(result.suggestionsToImproveATS) && result.suggestionsToImproveATS.length > 0 && (
                  <SectionCard variant="warning" title="Suggestions to Improve ATS" subtitle="Action items">
                    <ul className="space-y-2">
                      {result.suggestionsToImproveATS.map((t, idx) => (
                        <li key={idx} className="text-sm text-slate-700 dark:text-slate-300">
                          • {t}
                        </li>
                      ))}
                    </ul>
                  </SectionCard>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        title="Delete this analysis?"
        message="This will permanently remove the report from your history. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        busy={deleting}
        onCancel={() => {
          if (deleting) return;
          setConfirmDeleteId(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
