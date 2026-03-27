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

function variantChipClasses(variant) {
  if (variant === "success") {
    return {
      wrap: "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/10 border-l-emerald-500/60 dark:border-l-emerald-300/50",
      icon: "text-emerald-700 dark:text-emerald-300",
    };
  }
  if (variant === "danger") {
    return {
      wrap: "border-red-200 bg-red-50/50 dark:border-red-900/60 dark:bg-red-950/10 border-l-red-500/60 dark:border-l-red-300/50",
      icon: "text-red-700 dark:text-red-300",
    };
  }
  return {
    wrap: "border-amber-200 bg-amber-50/50 dark:border-amber-900/60 dark:bg-amber-950/10 border-l-amber-500/60 dark:border-l-amber-300/50",
    icon: "text-amber-700 dark:text-amber-300",
  };
}

function StatusIcon({ variant }) {
  const cls = variantChipClasses(variant);
  if (variant === "success") {
    return (
      <svg viewBox="0 0 20 20" className={["h-4 w-4", cls.icon].join(" ")} fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M14.03 6.47a1 1 0 0 0-1.415-1.414L9 8.672 7.884 7.556a1 1 0 1 0-1.414 1.414l1.823 1.823a1 1 0 0 0 1.414 0l4.323-4.323Zm-.323 4.5a1 1 0 0 0-1.414-1.414L9 12.849l-1.116-1.116a1 1 0 1 0-1.414 1.414l1.823 1.823a1 1 0 0 0 1.414 0l4.323-4.323Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (variant === "danger") {
    return (
      <svg viewBox="0 0 20 20" className={["h-4 w-4", cls.icon].join(" ")} fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm2.707-10.707a1 1 0 0 0-1.414-1.414L10 7.586 8.707 6.293a1 1 0 1 0-1.414 1.414L8.586 9l-1.293 1.293a1 1 0 1 0 1.414 1.414L10 10.414l1.293 1.293a1 1 0 0 0 1.414-1.414L11.414 9l1.293-1.293Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" className={["h-4 w-4", cls.icon].join(" ")} fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.72-1.36 3.486 0l6.518 11.59c.75 1.334-.213 2.993-1.742 2.993H3.48c-1.53 0-2.492-1.659-1.742-2.993l6.519-11.59ZM11 14a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-1-7a1 1 0 0 0-1 1v3a1 1 0 1 0 2 0V8a1 1 0 0 0-1-1Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ScoreChip({ label, score }) {
  const safeScore = clampScore(score);
  const variant = variantFromScore(safeScore);
  const cls = variantChipClasses(variant);
  return (
    <div
      className={[
        "min-w-[220px] rounded-2xl border bg-white/60 dark:bg-slate-900/30 p-4 border-l-4 transition-transform duration-200 hover:-translate-y-0.5",
        cls.wrap,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
        <StatusIcon variant={variant} />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
          {safeScore}
        </div>
        <div className="text-sm text-slate-500">/100</div>
      </div>
      <div className="mt-3 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 transition-[width] duration-700 ease-out"
          style={{ width: `${safeScore}%` }}
        />
      </div>
    </div>
  );
}

export default function SectionScores({ sectionScores }) {
  const s = sectionScores || {};
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20 p-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Section Scores</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">Scroll horizontally</div>
      </div>

      <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
        <ScoreChip label="Skills" score={s.skills} />
        <ScoreChip label="Experience" score={s.experience} />
        <ScoreChip label="Education" score={s.education} />
        <ScoreChip label="Projects" score={s.projects} />
        <ScoreChip label="Keywords" score={s.keywordsMatch} />
      </div>
    </div>
  );
}

