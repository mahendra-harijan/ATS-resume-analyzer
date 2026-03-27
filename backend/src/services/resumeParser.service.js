const pdfParseModule = require("pdf-parse");
const PDFParse = pdfParseModule?.PDFParse || pdfParseModule?.default?.PDFParse;
const mammoth = require("mammoth");

async function extractTextFromPdf(buffer) {
  if (!PDFParse) {
    throw new Error("pdf-parse is installed but PDFParse export was not found");
  }

  const parser = new PDFParse({ data: buffer });
  try {
    const data = await parser.getText();
    return data?.text || "";
  } finally {
    await parser.destroy();
  }
}

function normalizeText(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractTextFromResume({ buffer, mimeType }) {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error("Resume file is empty");
  }

  let text = "";
  if (mimeType === "application/pdf") {
    text = await extractTextFromPdf(buffer);
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.documentm" // defensive
  ) {
    const result = await mammoth.extractRawText({ buffer });
    text = result?.value || "";
  } else {
    const err = new Error("Unsupported resume file type");
    err.statusCode = 415;
    err.expose = true;
    throw err;
  }

  const normalized = normalizeText(text);
  if (normalized.length < 50) {
    const err = new Error("Could not extract enough text from the resume");
    err.statusCode = 422;
    err.expose = true;
    throw err;
  }

  // Avoid extremely large prompts.
  return normalized.slice(0, 80000);
}

module.exports = { extractTextFromResume };

