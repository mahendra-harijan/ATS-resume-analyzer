const fs = require("fs/promises");
const path = require("path");
const puppeteer = require("puppeteer");

function httpError(statusCode, message, details) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.expose = true;
  if (details) err.details = details;
  return err;
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function htmlToPdf({ html, outputPath }) {
  if (!html || typeof html !== "string") throw httpError(400, "html must be a non-empty string");
  if (!outputPath || typeof outputPath !== "string") throw httpError(400, "outputPath is required");

  await ensureDir(path.dirname(outputPath));

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: { top: "13mm", right: "13mm", bottom: "13mm", left: "13mm" },
    });

    return outputPath;
  } catch (e) {
    throw httpError(500, "PDF render failed", { message: e?.message || String(e) });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

module.exports = { htmlToPdf };
