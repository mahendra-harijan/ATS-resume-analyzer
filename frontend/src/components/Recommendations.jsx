function RecCard({ title, items }) {
  const safeItems = Array.isArray(items) ? items : [];
  if (safeItems.length === 0) return null;

  return (
    <div className="min-w-[320px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 p-4 border-l-4 border-l-fuchsia-500/50 dark:border-l-fuchsia-300/40 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</div>
      <ul className="mt-3 space-y-2">
        {safeItems.map((t, idx) => (
          <li key={idx} className="text-sm text-slate-700 dark:text-slate-300">
            • {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Recommendations({ recommendations }) {
  const r = recommendations || {};
  const cards = [
    { t: "Skills", v: r.skills },
    { t: "Experience", v: r.experience },
    { t: "Education", v: r.education },
    { t: "Projects", v: r.projects },
    { t: "Keywords match", v: r.keywordsMatch },
    { t: "Overall guidance", v: r.overall },
  ].filter((c) => Array.isArray(c.v) && c.v.length > 0);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recommendations</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">Scroll horizontally</div>
      </div>

      {cards.length === 0 ? (
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">No recommendations.</div>
      ) : (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
          {cards.map((c) => (
            <RecCard key={c.t} title={c.t} items={c.v} />
          ))}
        </div>
      )}
    </div>
  );
}

