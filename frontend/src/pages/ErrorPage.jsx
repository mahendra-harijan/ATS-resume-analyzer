import { useMemo, useState, useEffect } from "react";

// ─── Google Fonts ─────────────────────────────────────────────────────────────
if (typeof document !== "undefined" && !document.getElementById("ep-fonts")) {
  const link = document.createElement("link");
  link.id = "ep-fonts";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap";
  document.head.appendChild(link);
}

// ─── Error config map ─────────────────────────────────────────────────────────
const ERROR_CONFIG = {
  400: {
    code: 400, label: "Bad Request",
    title: "Bad Request",
    message: "The server couldn't understand your request. Please check and try again.",
    accentColor: "#e07b20", borderColor: "#7a4010", bgColor: "#1a0e06",
    chipColor: "rgba(224,123,32,0.1)", chipBorder: "rgba(224,123,32,0.28)", chipText: "#c07040",
    dotColor: "#e07b20", screenColor: "#fac775", badgeText: "BAD REQUEST",
  },
  401: {
    code: 401, label: "Unauthorized",
    title: "Unauthorized Access",
    message: "You need to be authenticated to access this resource.",
    accentColor: "#d85a30", borderColor: "#7a2e10", bgColor: "#1a0a06",
    chipColor: "rgba(216,90,48,0.1)", chipBorder: "rgba(216,90,48,0.28)", chipText: "#c06040",
    dotColor: "#d85a30", screenColor: "#f09970", badgeText: "UNAUTHORIZED",
  },
  403: {
    code: 403, label: "Forbidden",
    title: "Access Forbidden",
    message: "You don't have permission to access this page or resource.",
    accentColor: "#993556", borderColor: "#60203a", bgColor: "#14060e",
    chipColor: "rgba(153,53,86,0.1)", chipBorder: "rgba(153,53,86,0.28)", chipText: "#b05070",
    dotColor: "#d4537e", screenColor: "#ed93b1", badgeText: "FORBIDDEN",
  },
  404: {
    code: 404, label: "Not Found",
    title: "Page Not Found",
    message: "The page you're looking for has gone missing, moved, or never existed.",
    accentColor: "#378add", borderColor: "#1e3d6e", bgColor: "#091729",
    chipColor: "rgba(55,138,221,0.08)", chipBorder: "rgba(55,138,221,0.25)", chipText: "#5080b0",
    dotColor: "#378add", screenColor: "#b5d4f4", badgeText: "NOT FOUND",
  },
  408: {
    code: 408, label: "Request Timeout",
    title: "Request Timed Out",
    message: "The server took too long to respond. Please try again.",
    accentColor: "#e07b20", borderColor: "#7a4010", bgColor: "#1a0e06",
    chipColor: "rgba(224,123,32,0.1)", chipBorder: "rgba(224,123,32,0.28)", chipText: "#c07040",
    dotColor: "#e07b20", screenColor: "#fac775", badgeText: "TIMEOUT",
  },
  429: {
    code: 429, label: "Too Many Requests",
    title: "Slow Down!",
    message: "You've sent too many requests. Please wait a moment before trying again.",
    accentColor: "#ba7517", borderColor: "#6a4010", bgColor: "#150e04",
    chipColor: "rgba(186,117,23,0.1)", chipBorder: "rgba(186,117,23,0.28)", chipText: "#a07030",
    dotColor: "#ef9f27", screenColor: "#fac775", badgeText: "RATE LIMITED",
  },
  500: {
    code: 500, label: "Internal Server Error",
    title: "Internal Server Error",
    message: "Something went wrong on our end. Our team has been notified.",
    accentColor: "#e24b4a", borderColor: "#7a2020", bgColor: "#180808",
    chipColor: "rgba(226,75,74,0.08)", chipBorder: "rgba(226,75,74,0.22)", chipText: "#c07070",
    dotColor: "#e24b4a", screenColor: "#f09595", badgeText: "SERVER ERROR",
  },
  502: {
    code: 502, label: "Bad Gateway",
    title: "Bad Gateway",
    message: "The server received an invalid response from an upstream service.",
    accentColor: "#a32d2d", borderColor: "#601818", bgColor: "#120606",
    chipColor: "rgba(163,45,45,0.1)", chipBorder: "rgba(163,45,45,0.28)", chipText: "#b06060",
    dotColor: "#e24b4a", screenColor: "#f09595", badgeText: "BAD GATEWAY",
  },
  503: {
    code: 503, label: "Service Unavailable",
    title: "Service Unavailable",
    message: "The server is temporarily offline for maintenance. Please try again later.",
    accentColor: "#534ab7", borderColor: "#2e2870", bgColor: "#0e0c1e",
    chipColor: "rgba(83,74,183,0.1)", chipBorder: "rgba(83,74,183,0.28)", chipText: "#7070c0",
    dotColor: "#7f77dd", screenColor: "#afa9ec", badgeText: "UNAVAILABLE",
  },
  504: {
    code: 504, label: "Gateway Timeout",
    title: "Gateway Timeout",
    message: "An upstream server didn't respond in time. Please try again.",
    accentColor: "#e07b20", borderColor: "#7a4010", bgColor: "#1a0e06",
    chipColor: "rgba(224,123,32,0.1)", chipBorder: "rgba(224,123,32,0.28)", chipText: "#c07040",
    dotColor: "#e07b20", screenColor: "#fac775", badgeText: "GATEWAY TIMEOUT",
  },
};

// ─── Auto-detect status code ──────────────────────────────────────────────────
function detectStatusCode(statusCode, details, title, message) {
  if (statusCode && ERROR_CONFIG[statusCode]) return statusCode;
  const hay = `${safeText(details)} ${safeText(title)} ${safeText(message)}`.toLowerCase();
  const patterns = [
    { re: /\b504\b/,                                  code: 504 },
    { re: /\b503\b/,                                  code: 503 },
    { re: /\b502\b/,                                  code: 502 },
    { re: /\b500\b/,                                  code: 500 },
    { re: /\b429\b|too many requests|rate.?limit/,    code: 429 },
    { re: /\b408\b|timed? out|timeout/,               code: 408 },
    { re: /\b404\b|not found/,                        code: 404 },
    { re: /\b403\b|forbidden|not.?allowed|no permission/, code: 403 },
    { re: /\b401\b|unauthori[sz]ed|unauthenticated|login required/, code: 401 },
    { re: /\b400\b|bad request|invalid request/,      code: 400 },
  ];
  for (const { re, code } of patterns) if (re.test(hay)) return code;
  return 500;
}

// ─── Dynamic CSS ──────────────────────────────────────────────────────────────
const buildCss = (cfg) => `
  .ep-root{min-height:100vh;background:#07111f;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;overflow:hidden;position:relative;padding:40px 20px;}
  .ep-stars{position:absolute;inset:0;pointer-events:none;overflow:hidden;}
  .ep-star{position:absolute;background:#fff;border-radius:50%;animation:epStarTwinkle var(--dur) ease-in-out infinite var(--delay);}
  @keyframes epStarTwinkle{0%,100%{opacity:.12;transform:scale(1);}50%{opacity:.75;transform:scale(1.5);}}
  .ep-bits{position:absolute;inset:0;pointer-events:none;}
  .ep-bit{position:absolute;border-radius:3px;animation:epBitFloat var(--dur) ease-in-out infinite var(--delay);}
  @keyframes epBitFloat{0%,100%{transform:translateY(0) rotate(0deg);opacity:.7;}50%{transform:translateY(-16px) rotate(8deg);opacity:1;}}
  .ep-cloud{position:absolute;opacity:.1;animation:epCloudDrift 7s ease-in-out infinite;}
  .ep-cloud-l{top:50px;left:30px;animation-delay:0s;}
  .ep-cloud-r{top:40px;right:30px;animation-delay:2s;}
  @keyframes epCloudDrift{0%,100%{transform:translateX(0);}50%{transform:translateX(10px);}}

  .ep-card{position:relative;z-index:10;width:100%;max-width:560px;background:#0d1e33;border:1.5px solid ${cfg.borderColor};border-radius:20px;overflow:hidden;animation:epCardIn .6s cubic-bezier(.22,1,.36,1) both;}
  @keyframes epCardIn{from{opacity:0;transform:translateY(28px) scale(.97);}to{opacity:1;transform:translateY(0) scale(1);}}

  .ep-header{background:${cfg.bgColor};padding:36px 32px 28px;display:flex;flex-direction:column;align-items:center;border-bottom:1px solid ${cfg.borderColor};position:relative;overflow:hidden;}
  .ep-header::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(to bottom,transparent 0,transparent 3px,rgba(0,0,0,.07) 3px,rgba(0,0,0,.07) 4px);pointer-events:none;}

  .ep-monitor-wrap{position:relative;width:220px;margin-bottom:10px;}
  .ep-monitor{background:#040e1c;border:2px solid ${cfg.borderColor};border-radius:12px;width:220px;height:140px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden;animation:epMonitorPulse 3.5s ease-in-out infinite;}
  @keyframes epMonitorPulse{0%,100%{border-color:${cfg.borderColor};box-shadow:none;}50%{border-color:${cfg.accentColor};box-shadow:0 0 28px 4px ${cfg.accentColor}26;}}
  .ep-scanline{position:absolute;left:0;right:0;height:3px;background:${cfg.accentColor}44;animation:epScan 2.8s linear infinite;}
  @keyframes epScan{0%{top:0;opacity:.7;}100%{top:100%;opacity:0;}}
  .ep-big-num{font-family:'Syne',sans-serif;font-size:58px;font-weight:800;color:${cfg.screenColor};letter-spacing:-3px;line-height:1;animation:epFlicker 5s ease-in-out infinite;}
  @keyframes epFlicker{0%,88%,100%{opacity:1;}90%{opacity:.35;}92%{opacity:1;}94%{opacity:.15;}96%{opacity:1;}}
  .ep-screen-badge{margin-top:8px;background:${cfg.accentColor}18;border:1px solid ${cfg.accentColor}55;border-radius:20px;padding:2px 14px;font-size:9px;font-weight:600;letter-spacing:2px;color:${cfg.accentColor};text-transform:uppercase;}

  .ep-gear{position:absolute;top:-22px;left:4px;width:46px;height:46px;background:#071f12;border:2px solid #1d9e75;border-radius:50%;display:flex;align-items:center;justify-content:center;animation:epGearSpin 4s linear infinite;}
  @keyframes epGearSpin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
  .ep-globe{position:absolute;top:-22px;right:4px;width:46px;height:46px;background:#1a0808;border:2px solid #d85a30;border-radius:50%;display:flex;align-items:center;justify-content:center;animation:epGlobePulse 2.2s ease-in-out infinite;}
  @keyframes epGlobePulse{0%,100%{transform:scale(1);}50%{transform:scale(1.1);}}
  .ep-warn{position:absolute;bottom:-21px;left:22px;width:42px;height:42px;background:#180808;border:2px solid ${cfg.accentColor};border-radius:8px;display:flex;align-items:center;justify-content:center;animation:epWarnShake 3s ease-in-out infinite;}
  @keyframes epWarnShake{0%,75%,100%{transform:rotate(0deg);}78%{transform:rotate(-5deg);}82%{transform:rotate(5deg);}86%{transform:rotate(-3deg);}90%{transform:rotate(2deg);}}
  .ep-stand{width:44px;height:16px;background:#0e2236;border:1.5px solid ${cfg.borderColor};border-top:none;border-radius:0 0 6px 6px;margin:0 auto;}
  .ep-base{width:72px;height:6px;background:#0e2236;border:1.5px solid ${cfg.borderColor};border-radius:4px;margin:0 auto;}

  .ep-title-block{margin-top:32px;text-align:center;}
  .ep-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:700;color:${cfg.screenColor};letter-spacing:-.4px;}
  .ep-subtitle{font-size:14px;color:#3d5e82;margin-top:6px;line-height:1.6;}

  .ep-body{padding:20px 28px;}
  .ep-chip{display:flex;align-items:center;gap:10px;background:${cfg.chipColor};border:1px solid ${cfg.chipBorder};border-radius:10px;padding:10px 14px;margin-bottom:16px;}
  .ep-chip-dot{width:8px;height:8px;border-radius:50%;background:${cfg.dotColor};flex-shrink:0;animation:epDotPulse 1.4s ease-in-out infinite;}
  @keyframes epDotPulse{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.5);opacity:.5;}}
  .ep-chip-label{font-size:11px;color:${cfg.chipText}88;letter-spacing:.5px;}
  .ep-chip-code{font-family:'Courier New',monospace;font-size:12px;font-weight:600;color:${cfg.chipText};}
  .ep-chip-http{margin-left:auto;font-size:10px;font-weight:700;color:${cfg.accentColor};background:${cfg.accentColor}18;border:1px solid ${cfg.accentColor}44;border-radius:6px;padding:2px 8px;letter-spacing:.5px;}

  .ep-id-row{font-size:11px;color:#2a4466;margin-bottom:16px;}
  .ep-id-val{font-family:'Courier New',monospace;color:#3a5e82;}

  .ep-details-toggle{width:100%;display:flex;align-items:center;justify-content:space-between;background:#091729;border:1px solid ${cfg.borderColor};border-radius:10px;padding:10px 14px;cursor:pointer;color:#5f7fa8;font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;transition:border-color .2s,color .2s;margin-bottom:4px;}
  .ep-details-toggle:hover{border-color:${cfg.accentColor};color:#85b7eb;}
  .ep-details-toggle-right{display:flex;align-items:center;gap:12px;}
  .ep-copy-btn{font-size:11px;color:${cfg.accentColor};background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;padding:0;transition:color .2s;}
  .ep-copy-btn:hover{color:#85b7eb;}
  .ep-chevron{width:14px;height:14px;transition:transform .25s;}
  .ep-chevron.open{transform:rotate(180deg);}
  .ep-details-pre{background:#050f1a;border:1px solid ${cfg.borderColor};border-radius:10px;padding:14px 16px;font-size:11px;color:${cfg.chipText};font-family:'Courier New',monospace;overflow:auto;max-height:180px;line-height:1.6;margin-bottom:4px;animation:epSlideDown .25s ease both;}
  @keyframes epSlideDown{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);}}

  .ep-actions{padding:16px 28px 24px;display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;border-top:1px solid #0e2236;}
  .ep-btn-primary{background:${cfg.accentColor}cc;color:#fff;border:none;border-radius:10px;padding:10px 26px;font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;cursor:pointer;transition:background .2s,transform .15s;animation:epBtnGlow 3.5s ease-in-out infinite;}
  @keyframes epBtnGlow{0%,100%{box-shadow:none;}50%{box-shadow:0 0 18px 3px ${cfg.accentColor}55;}}
  .ep-btn-primary:hover{background:${cfg.accentColor};transform:scale(1.04);}
  .ep-btn-primary:active{transform:scale(.97);}
  .ep-btn-secondary{background:transparent;color:#3d5e82;border:1.5px solid ${cfg.borderColor};border-radius:10px;padding:10px 22px;font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;cursor:pointer;transition:border-color .2s,color .2s,transform .15s;}
  .ep-btn-secondary:hover{border-color:${cfg.accentColor};color:#85b7eb;transform:scale(1.04);}
  .ep-btn-secondary:active{transform:scale(.97);}

  .ep-help{padding:12px 28px 20px;font-size:12px;color:#2a3f55;border-top:1px solid #0e2236;display:flex;align-items:center;gap:8px;}
  .ep-help-dot{width:5px;height:5px;border-radius:50%;background:${cfg.dotColor};flex-shrink:0;animation:epDotPulse 2s ease-in-out infinite;}

  .ep-dots{display:flex;gap:6px;justify-content:center;margin-top:14px;}
  .ep-dot{width:6px;height:6px;border-radius:50%;background:#1e3d6e;animation:epDotBounce 1.5s ease-in-out infinite;}
  .ep-dot:nth-child(2){animation-delay:.2s;}
  .ep-dot:nth-child(3){animation-delay:.4s;}
  @keyframes epDotBounce{0%,80%,100%{transform:scale(1);background:#1e3d6e;}40%{transform:scale(1.5);background:${cfg.accentColor};}}
`;

// ─── Decorative bits ──────────────────────────────────────────────────────────
const makeBits = (cfg) => [
  { w:22, h:10, color:"#22883a",       top:"12%", left:"4%",  dur:"3.8s", delay:"0s"   },
  { w:12, h:12, color:cfg.accentColor, top:"22%", left:"7%",  dur:"4.2s", delay:"0.6s" },
  { w:18, h: 8, color:"#22883a",       top:"53%", left:"3%",  dur:"3.5s", delay:"1s"   },
  { w:10, h:10, color:cfg.dotColor,    top:"73%", left:"6%",  dur:"4.6s", delay:"0.3s" },
  { w:16, h: 7, color:cfg.accentColor, top:"66%", left:"2%",  dur:"3.9s", delay:"1.4s" },
  { w:11, h:11, color:"#185fa5",       top: "9%", right:"3%", dur:"4.1s", delay:"0.8s" },
  { w:14, h:14, color:"#f4c700",       top:"29%", right:"5%", dur:"3.7s", delay:"0.2s" },
  { w:20, h: 9, color:cfg.accentColor, top:"54%", right:"4%", dur:"4.4s", delay:"1.2s" },
  { w:10, h:10, color:"#f4c700",       top:"71%", right:"6%", dur:"3.6s", delay:"0.5s" },
  { w:15, h: 7, color:cfg.dotColor,    top:"83%", right:"3%", dur:"4.0s", delay:"1.6s" },
];

const STARS = Array.from({ length: 36 }, () => ({
  size: Math.random() * 2 + 1,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  dur: `${2 + Math.random() * 3}s`,
  delay: `${Math.random() * 4}s`,
}));

// ─── SVG icons ────────────────────────────────────────────────────────────────
function Cloud() {
  return (
    <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
      <circle cx="32" cy="40" r="22" fill="#3a5a8a"/>
      <circle cx="55" cy="32" r="26" fill="#3a5a8a"/>
      <circle cx="76" cy="40" r="18" fill="#3a5a8a"/>
      <rect x="10" y="40" width="70" height="18" rx="2" fill="#3a5a8a"/>
    </svg>
  );
}
function GearIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="5" stroke="#1d9e75" strokeWidth="2"/>
      <path d="M15 2v3M15 25v3M2 15h3M25 15h3M5.7 5.7l2.1 2.1M22.2 22.2l2.1 2.1M22.2 5.7l-2.1 2.1M7.8 22.2l-2.1 2.1"
        stroke="#1d9e75" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="12" stroke="#d85a30" strokeWidth="2"/>
      <ellipse cx="15" cy="15" rx="6" ry="12" stroke="#d85a30" strokeWidth="1.5"/>
      <line x1="3" y1="15" x2="27" y2="15" stroke="#d85a30" strokeWidth="1.5"/>
      <line x1="5" y1="9"  x2="25" y2="9"  stroke="#d85a30" strokeWidth="1"/>
      <line x1="5" y1="21" x2="25" y2="21" stroke="#d85a30" strokeWidth="1"/>
    </svg>
  );
}
function WarnIcon({ color }) {
  return (
    <svg width="22" height="20" viewBox="0 0 28 26" fill="none">
      <path d="M14 2L27 24H1L14 2Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill="#2a0808"/>
      <line x1="14" y1="10" x2="14" y2="17" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="14" cy="21" r="1.5" fill={color}/>
    </svg>
  );
}
function ChevronDown({ open }) {
  return (
    <svg className={`ep-chevron${open ? " open" : ""}`} viewBox="0 0 14 14" fill="none">
      <path d="M2 4.5L7 9.5L12 4.5" stroke="#3d5e82" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function safeText(v) {
  if (v === null || v === undefined) return "";
  return String(v);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ErrorPage({
  statusCode,       // number — pass explicitly or let it auto-detect
  title,
  message,
  details,
  primaryAction,
  secondaryAction,
}) {
  const detailsText = useMemo(() => safeText(details).trim(), [details]);
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [errorId] = useState(() =>
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );

  const resolvedCode = useMemo(
    () => detectStatusCode(statusCode, details, title, message),
    [statusCode, details, title, message]
  );
  const cfg          = ERROR_CONFIG[resolvedCode] ?? ERROR_CONFIG[500];
  const displayTitle   = title   || cfg.title;
  const displayMessage = message || cfg.message;
  const BITS         = useMemo(() => makeBits(cfg), [cfg]);

  useEffect(() => {
    let t;
    if (copied) t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopyError = async (e) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(detailsText);
        setCopied(true);
      }
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleReload = () => window.location.reload();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: buildCss(cfg) }} />
      <div className="ep-root">

        <div className="ep-stars">
          {STARS.map((s, i) => (
            <div key={i} className="ep-star"
              style={{ width: s.size, height: s.size, top: s.top, left: s.left, "--dur": s.dur, "--delay": s.delay }}
            />
          ))}
        </div>

        <div className="ep-bits">
          {BITS.map((b, i) => (
            <div key={i} className="ep-bit"
              style={{ width: b.w, height: b.h, background: b.color, top: b.top, left: b.left, right: b.right, "--dur": b.dur, "--delay": b.delay }}
            />
          ))}
        </div>

        <div className="ep-cloud ep-cloud-l"><Cloud /></div>
        <div className="ep-cloud ep-cloud-r"><Cloud /></div>

        <div className="ep-card">

          {/* ── Header ── */}
          <div className="ep-header">
            <div className="ep-monitor-wrap">
              <div className="ep-gear"><GearIcon /></div>
              <div className="ep-globe"><GlobeIcon /></div>
              <div className="ep-monitor">
                <div className="ep-scanline" />
                <div className="ep-big-num">{cfg.code}</div>
                <div className="ep-screen-badge">{cfg.badgeText}</div>
              </div>
              <div className="ep-warn"><WarnIcon color={cfg.accentColor} /></div>
              <div className="ep-stand" />
              <div className="ep-base" />
            </div>
            <div className="ep-title-block">
              <div className="ep-title">{displayTitle}</div>
              <div className="ep-subtitle">{displayMessage}</div>
              <div className="ep-dots">
                <div className="ep-dot"/><div className="ep-dot"/><div className="ep-dot"/>
              </div>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="ep-body">
            <div className="ep-chip">
              <div className="ep-chip-dot" />
              <span className="ep-chip-label">Status&nbsp;&nbsp;</span>
              <span className="ep-chip-code">HTTP {cfg.code} — {cfg.label}</span>
              <span className="ep-chip-http">{cfg.code}</span>
            </div>

            <div className="ep-id-row">
              Error ID:&nbsp;<span className="ep-id-val">{errorId}</span>
            </div>

            {detailsText && (
              <>
                <button className="ep-details-toggle" onClick={() => setShowDetails((v) => !v)}>
                  <span>Technical Details</span>
                  <span className="ep-details-toggle-right">
                    {showDetails && (
                      <button className="ep-copy-btn" onClick={handleCopyError}>
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    )}
                    <ChevronDown open={showDetails} />
                  </span>
                </button>
                {showDetails && <pre className="ep-details-pre">{detailsText}</pre>}
              </>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="ep-actions">
            {secondaryAction && (
              <button className="ep-btn-secondary" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </button>
            )}
            {primaryAction ? (
              <button className="ep-btn-primary" onClick={primaryAction.onClick}>
                {primaryAction.label}
              </button>
            ) : (
              <button className="ep-btn-primary" onClick={handleReload}>
                Reload Page
              </button>
            )}
          </div>

          {/* ── Help ── */}
          <div className="ep-help">
            <div className="ep-help-dot" />
            If the problem persists, please contact support.
          </div>
        </div>
      </div>
    </>
  );
}

