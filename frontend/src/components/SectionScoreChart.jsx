function clampScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export default function SectionScoreChart({ sectionScores }) {
  const s = sectionScores || {};
  const items = [
    { key: "skills", label: "Skills", value: clampScore(s.skills) },
    { key: "experience", label: "Experience", value: clampScore(s.experience) },
    { key: "education", label: "Education", value: clampScore(s.education) },
    { key: "projects", label: "Projects", value: clampScore(s.projects) },
    { key: "keywordsMatch", label: "Keywords", value: clampScore(s.keywordsMatch) },
  ];

  const W = 100;
  const H = 60;
  const paddingX = 6;
  const baselineY = 52;
  const maxBarHeight = 34;
  const gap = 2;
  const barSlot = (W - paddingX * 2) / items.length;
  const barWidth = Math.max(1, barSlot - gap);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Section Score Chart</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Visual breakdown (0-100)</div>
        </div>
      </div>

      <div className="mt-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-40 text-indigo-600 dark:text-indigo-300"
          role="img"
          aria-label="Section scores bar chart"
        >
          <line x1={paddingX} y1={baselineY} x2={W - paddingX} y2={baselineY} stroke="currentColor" opacity="0.25" />
          {items.map((it, idx) => {
            const x = paddingX + idx * barSlot + gap / 2;
            const h = (it.value / 100) * maxBarHeight;
            const y = baselineY - h;
            return (
              <g key={it.key}>
                <rect x={x} y={y} width={barWidth} height={h} fill="currentColor" rx="1.5" opacity="0.9" />
              </g>
            );
          })}
        </svg>

        <div className="mt-2 grid grid-cols-2 sm:grid-cols-5 gap-2">
          {items.map((it) => (
            <div key={it.key} className="text-xs text-slate-600 dark:text-slate-300">
              <div className="font-medium text-slate-900 dark:text-slate-100">{it.label}</div>
              <div>{it.value}/100</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
