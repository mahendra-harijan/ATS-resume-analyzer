export default function ScoreProgress({ score }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-500">Overall ATS Score</div>
        <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {safeScore}/100
        </div>
      </div>
      <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500"
          style={{ width: `${safeScore}%` }}
        />
      </div>
    </div>
  );
}

