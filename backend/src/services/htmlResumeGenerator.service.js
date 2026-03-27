const fs = require("fs/promises");
const path = require("path");

const { buildHtmlResumePrompt } = require("./advancedResumePrompt.service");
const { generateHtmlResume } = require("./htmlResumeLlm.service");
const { htmlToPdf } = require("./pdf.service");

function httpError(statusCode, message, details) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.expose = true;
  if (details) err.details = details;
  return err;
}

function looksLikeHtml(html) {
  const s = String(html || "").trim().toLowerCase();
  return s.includes("<html") && s.includes("</html>");
}

function wrapHtmlDocument(fragment) {
  const content = String(fragment || "").trim();
  return `<!doctype html><html><head><meta charset="utf-8" /></head><body>${content}</body></html>`;
}

function stripMarkdownCodeFences(text) {
  const s = String(text || "").trim();
  if (!s) return s;
  // Common LLM mistake: wrapping HTML in ```html ... ```
  const fenced = s.match(/^```(?:html)?\s*\n([\s\S]*?)\n```\s*$/i);
  if (fenced && fenced[1]) return String(fenced[1]).trim();
  return s;
}

function enforceSinglePageHints(html) {
  const s = String(html || "");
  if (!s) return s;

  // If the model forgot to include print/page sizing, prepend a minimal style block.
  // We keep it additive and non-destructive.
  if (/<style[\s>]/i.test(s) && /@page\s*\{/i.test(s)) return s;

  const injection = `\n<style>\n@page{ size:A4; margin:12mm; }\nhtml,body{ -webkit-print-color-adjust:exact; print-color-adjust:exact; }\n*{ box-sizing:border-box; }\nbody{ font-family: Arial, Helvetica, sans-serif; font-size:10px; line-height:1.22; color:#111; }\n.container{ width:100%; max-width:190mm; margin:0 auto; }\n\n/* Target reference look (compact to force 1-page) */\n.resume{ width:100%; }\n.top{ text-align:center; margin-top:0; }\n.name{ font-size:15px; font-weight:700; color:#2f66d3; margin:0 0 2px 0; }\n.line1{ font-size:10px; color:#111; margin:0 0 4px 0; }\n.line2{ font-size:9.5px; color:#111; margin:0 0 6px 0; }\n.line2 a{ color:#2f66d3; text-decoration:none; font-weight:600; }\n.line2 .sep{ color:#111; margin:0 6px; }\n\n.section{ margin-top:8px; }\n.heading{ font-size:10px; font-weight:700; color:#2f66d3; text-transform:uppercase; letter-spacing:0.25px; margin:0 0 2px 0; }\n.divider{ border-top:1px solid #2b2b2b; margin:0 0 4px 0; }\n\n.dlist{ list-style:none; padding:0; margin:0; }\n.dlist > li{ display:flex; gap:7px; margin:0 0 3px 0; }\n.d{ width:13px; flex:0 0 13px; font-size:9px; margin-top:2px; }\n.c{ flex:1 1 auto; min-width:0; }\n\n.row{ display:flex; justify-content:space-between; gap:10px; }\n.left{ font-weight:700; }\n.right{ white-space:nowrap; font-size:9.5px; color:#333; }\n.stack{ font-style:italic; color:#444; font-size:9.5px; margin:1px 0 1px 0; }\n\n.bullets{ margin:1px 0 0 16px; padding:0; }\n.bullets li{ margin:0 0 1px 0; }\n\n/* Links in project title line */\n.plink a{ color:#2f66d3; text-decoration:none; font-weight:600; }\n</style>\n`;

  if (/<head[^>]*>/i.test(s)) {
    const withStyle = s.replace(/<head([^>]*)>/i, (m) => `${m}${injection}`);
    // Ensure a consistent container for layout.
    if (/<div\s+class=["']container["']/i.test(withStyle)) return withStyle;
    if (/<body[^>]*>/i.test(withStyle)) {
      return withStyle
        .replace(/<body([^>]*)>/i, '<body$1><div class="container">')
        .replace(/<\/body>\s*$/i, '</div></body>');
    }
    return withStyle;
  }
  return s;
}

function hardLimitOverflow(html) {
  let s = String(html || "");
  if (!s) return s;

  // Limit project bullets (ul.bullets) to 3 items.
  s = s.replace(/<ul\s+class=["']bullets["'][^>]*>([\s\S]*?)<\/ul>/gi, (m, inner) => {
    const items = inner.match(/<li[\s\S]*?<\/li>/gi) || [];
    const kept = items.slice(0, 3).join("");
    return `<ul class="bullets">${kept}</ul>`;
  });

  // Limit diamond lists to 8 items overall per section.
  s = s.replace(/<ul\s+class=["']dlist["'][^>]*>([\s\S]*?)<\/ul>/gi, (m, inner) => {
    const items = inner.match(/<li[\s\S]*?<\/li>/gi) || [];
    const kept = items.slice(0, 8).join("");
    return `<ul class="dlist">${kept}</ul>`;
  });

  return s;
}

async function generateHtmlResumePdf({ payload, fileBaseName }) {
  const prompt = buildHtmlResumePrompt(payload);
  const htmlRaw = await generateHtmlResume({ prompt });
  const cleaned = stripMarkdownCodeFences(htmlRaw);
  const normalized = looksLikeHtml(cleaned) ? cleaned : wrapHtmlDocument(cleaned);
  const html = hardLimitOverflow(enforceSinglePageHints(normalized));

  const generatedDir = path.join(__dirname, "..", "generated");
  await fs.mkdir(generatedDir, { recursive: true });

  const htmlPath = path.join(generatedDir, `${fileBaseName}.html`);
  const pdfPath = path.join(generatedDir, `${fileBaseName}.pdf`);

  await fs.writeFile(htmlPath, html, "utf8");
  await htmlToPdf({ html, outputPath: pdfPath });

  return {
    html,
    htmlPath,
    pdfPath,
    htmlUrl: `/generated/${encodeURIComponent(path.basename(htmlPath))}`,
    pdfUrl: `/generated/${encodeURIComponent(path.basename(pdfPath))}`,
  };
}

module.exports = { generateHtmlResumePdf };
