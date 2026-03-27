const { atsAnalysisSchema } = require("../schemas/atsSchema");
const geminiService = require("./gemini.service");

async function scoreResumeAgainstJob({ resumeText, jobDescription }) {
  const raw = await geminiService.analyzeResume({ resumeText, jobDescription });

  const parsed = atsAnalysisSchema.safeParse(raw);
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

