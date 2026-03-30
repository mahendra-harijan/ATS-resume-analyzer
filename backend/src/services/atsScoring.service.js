const { atsAnalysisSchema } = require("../schemas/atsSchema");
const geminiService = require("./gemini.service");

function clampIntScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function asStringArray(value, max = 200) {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean)
    .slice(0, max);
}

function uniqStrings(items) {
  const out = [];
  const seen = new Set();
  for (const s of items) {
    const key = String(s).trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

function normalizeAtsResult(raw) {
  const r = raw && typeof raw === "object" ? raw : {};

  // Section scores: accept either the expected keys or superset (ignore extras).
  const section = r.sectionScores && typeof r.sectionScores === "object" ? r.sectionScores : {};
  const sectionScores = {
    skills: clampIntScore(section.skills),
    experience: clampIntScore(section.experience),
    education: clampIntScore(section.education),
    projects: clampIntScore(section.projects),
    keywordsMatch: clampIntScore(section.keywordsMatch),
  };

  // Missing keywords: support both current contract and older prompt shape.
  const missingKeywords = uniqStrings(
    asStringArray(r.missingKeywords, 200).concat(
      asStringArray(r.keywordAnalysis?.missingPrimary, 200),
      asStringArray(r.keywordAnalysis?.missingSecondary, 200)
    )
  ).slice(0, 200);

  // Recommendations: support both contract buckets and older prompt shape.
  const rec = r.recommendations && typeof r.recommendations === "object" ? r.recommendations : {};
  const recommendations = {
    skills: asStringArray(rec.skills, 15),
    experience: asStringArray(rec.experience, 15),
    education: asStringArray(rec.education, 15),
    projects: asStringArray(rec.projects, 15),
    keywordsMatch: asStringArray(rec.keywordsMatch, 15).length
      ? asStringArray(rec.keywordsMatch, 15)
      : asStringArray(rec.keywords, 15),
    overall: asStringArray(rec.overall, 20),
  };

  // Suggestions: support contract and older prompt formatting suggestions.
  const suggestionsToImproveATS = uniqStrings(
    asStringArray(r.suggestionsToImproveATS, 25).concat(asStringArray(rec.formatting, 25))
  ).slice(0, 25);

  const finalRecommendations = asStringArray(r.finalRecommendations, 20);

  const overallScore = clampIntScore(r.overallScore);

  // Provide a minimal overall bucket if missing.
  if (recommendations.overall.length === 0 && finalRecommendations.length > 0) {
    recommendations.overall = finalRecommendations.slice(0, 20);
  }

  return {
    overallScore,
    sectionScores,
    missingKeywords,
    recommendations,
    suggestionsToImproveATS,
    finalRecommendations,
  };
}

async function scoreResumeAgainstJob({ resumeText, jobDescription }) {
  const raw = await geminiService.analyzeResume({ resumeText, jobDescription });
  const normalized = normalizeAtsResult(raw);

  const parsed = atsAnalysisSchema.safeParse(normalized);
  if (!parsed.success) {
    const err = new Error("LLM returned an invalid ATS JSON structure");
    err.statusCode = 502;
    err.expose = true;
    err.details = parsed.error.flatten();
    throw err;
  }

  return parsed.data;
}

module.exports = { scoreResumeAgainstJob };

