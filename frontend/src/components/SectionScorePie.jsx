import { useEffect, useMemo, useState } from "react";

function clampScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export default function SectionScorePie({ sectionScores }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setAnimate(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const items = useMemo(() => {
    const s = sectionScores || {};
    return [
      { key: "skills", label: "Skills", value: clampScore(s.skills), color: "text-indigo-600 dark:text-indigo-300" },
      { key: "experience", label: "Experience", value: clampScore(s.experience), color: "text-fuchsia-600 dark:text-fuchsia-300" },
      { key: "education", label: "Education", value: clampScore(s.education), color: "text-indigo-500 dark:text-indigo-200" },
      { key: "projects", label: "Projects", value: clampScore(s.projects), color: "text-fuchsia-500 dark:text-fuchsia-200" },
      { key: "keywordsMatch", label: "Keywords", value: clampScore(s.keywordsMatch), color: "text-indigo-700 dark:text-indigo-200" },
    ];
  }, [sectionScores]);

  const total = useMemo(() => items.reduce((sum, it) => sum + it.value, 0), [items]);

  const size = 180;
  const cx = 90;
  const cy = 90;
  const r = 64;
  const stroke = 14;

  const arcs = useMemo(() => {
    if (total <= 0) return [];

    let start = 0;
    const gapDeg = 2.0;

    return items
      .filter((it) => it.value > 0)
      .map((it) => {
        const portion = it.value / total;
        const sweep = Math.max(0, portion * 360 - gapDeg);
        const a0 = start + gapDeg / 2;
        const a1 = start + gapDeg / 2 + sweep;
        start += portion * 360;
        return { ...it, startAngle: a0, endAngle: a1 };
      });
  }, [items, total]);

  const ringClass = animate ? "[stroke-dashoffset:0]" : "[stroke-dashoffset:2000]";

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Section Score Pie</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Animated breakdown (0-100)</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
        <div className="flex items-center justify-center">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-label="Section scores donut chart"
            className="block"
          >
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(100,116,139,0.25)" strokeWidth={stroke} />

            {total <= 0 ? (
              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="fill-slate-500" fontSize="12">
                No section scores
              </text>
            ) : (
              <>
                {arcs.map((a) => (
                  <path
                    key={a.key}
                    d={describeArc(cx, cy, r, a.startAngle, a.endAngle)}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    className={[
                      a.color,
                      "transition-[stroke-dashoffset] duration-700 ease-out",
                      "[stroke-dasharray:2000]",
                      ringClass,
                    ].join(" ")}
                  />
                ))}

                <text
                  x={cx}
                  y={cy - 4}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-900 dark:fill-slate-100"
                  fontSize="18"
                  fontWeight="600"
                >
                  {Math.round(total / items.length)}
                </text>
                <text
                  x={cx}
                  y={cy + 14}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-500 dark:fill-slate-400"
                  fontSize="10"
                >
                  avg / 100
                </text>
              </>
            )}
          </svg>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/20 p-4">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Index</div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((it) => (
              <div
                key={it.key}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30 px-3 py-2 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={["h-2.5 w-2.5 rounded-full", it.color].join(" ") + " bg-current"} />
                  <div className="text-sm text-slate-700 dark:text-slate-200 truncate">{it.label}</div>
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{it.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
