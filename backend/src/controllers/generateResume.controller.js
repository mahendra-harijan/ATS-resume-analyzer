const path = require("path");

const { generateHtmlResumePdf } = require("../services/htmlResumeGenerator.service");

function httpError(statusCode, message, details) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.expose = true;
  if (details) err.details = details;
  return err;
}

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function extractNameFromText(userDetailsText) {
  const text = String(userDetailsText || "");
  const m = text.match(/\bname\s*:\s*(.+)$/im);
  if (!m) return null;
  const name = String(m[1] || "").trim();
  if (!name) return null;
  return name;
}

async function generateResume(req, res, next) {
  try {
    const userDetails = req.body?.userDetails;
    const jobDescription = req.body?.jobDescription;

    if (!isNonEmptyString(userDetails)) throw httpError(400, "userDetails is required");
    if (!isNonEmptyString(jobDescription)) throw httpError(400, "jobDescription is required");

    const extractedName = extractNameFromText(userDetails) || "candidate";

    const safeName = String(extractedName)
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_\-]/g, "");

    if (!safeName) throw httpError(400, "Invalid name");

    const fileBaseName = `${safeName}_resume`;
    const minimalPayload = {
      personalDetails: { name: extractedName, email: "", phone: "", github: "", linkedin: "", location: "" },
      education: [],
      technicalSkills: { languages: [], tools: [], technologies: [] },
      projects: [],
      experience: [],
      extraSections: [{ title: "User Details", content: userDetails }],
      jobDescription,
    };

    const { htmlPath, pdfPath, pdfUrl, htmlUrl } = await generateHtmlResumePdf({ payload: minimalPayload, fileBaseName });

    res.json({
      success: true,
      latexCode: "",
      htmlUrl,
      pdfUrl,
      meta: {
        htmlPath: path.basename(htmlPath),
        pdfPath: path.basename(pdfPath),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { generateResume };
