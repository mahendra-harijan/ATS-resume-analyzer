export default function KeywordGaps({ missingKeywords }) {
  const list = Array.isArray(missingKeywords) ? missingKeywords : [];
  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 p-4">
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Keyword Gaps</div>
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">No missing keywords detected.</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 p-4">
      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Missing Keywords</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {list.slice(0, 30).map((k, idx) => (
          <span
            key={`${k}-${idx}`}
            className="px-3 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
          >
            {k}
          </span>
        ))}
      </div>
      {list.length > 30 && (
        <div className="mt-2 text-xs text-slate-500">Showing first 30 of {list.length} keywords.</div>
      )}
    </div>
  );
}

