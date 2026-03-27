export default function HistoryList({ items, selectedId, onSelect, onDelete }) {
  const list = Array.isArray(items) ? items : [];
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Previous Analyses</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{list.length} saved</div>
        </div>
      </div>
      {list.length === 0 ? (
        <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-300">No analyses yet.</div>
      ) : (
        <ul className="divide-y divide-slate-200 dark:divide-slate-800">
          {list.map((it) => (
            <li key={it.reportId}>
              <div
                className={[
                  "px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition",
                  selectedId === it.reportId ? "bg-slate-50 dark:bg-slate-800/50" : "",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onSelect?.(it.reportId)}
                    className="min-w-0 flex-1 text-left"
                    aria-label={`Open report ${it.filename || "Resume"}`}
                  >
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {it.filename || "Resume"}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(it.createdAt).toLocaleString()}
                    </div>
                  </button>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">
                      {typeof it.overallScore === "number" ? it.overallScore : "--"}{" "}
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/100</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete?.(it.reportId);
                      }}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-medium border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/20 text-red-700 dark:text-red-200 hover:bg-red-50 transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
                      aria-label={`Delete report ${it.filename || "Resume"}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

