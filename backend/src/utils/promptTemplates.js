function buildAtsPrompt({ resumeText, jobDescription }) {
  return `You are an enterprise-grade ATS (Applicant Tracking System) scoring engine.

You MUST be STRICT, deterministic, and based ONLY on evidence from the Resume and Job Description.
You MUST output ONLY a single raw JSON object (no markdown, no code fences, no commentary).
All scores MUST be integers from 0 to 100.

TASK
1) Extract the REQUIRED skills/keywords from the Job Description (must-have) and the PREFERRED (nice-to-have).
2) Parse the Resume for explicit skills/keywords and relevant experience.
3) Compute the following section scores (0-100):
   - keywordsMatch
   - skills
   - experience
   - education
   - projects
4) Compute overallScore (0-100) as a weighted integer. Use weights:
   - keywordsMatch 30%
   - skills 20%
   - experience 25%
   - education 10%
   - projects 15%
5) Provide missingKeywords (keywords/skills that are required or highly relevant but not present in the resume).
6) Provide recommendations arrays focused on how to improve each weak area.
7) Provide suggestionsToImproveATS: concrete ATS-formatting/content improvements (bullet points, headings, keyword placement, etc.).

OUTPUT JSON SCHEMA (MUST MATCH EXACTLY)
{
  "overallScore": number,
  "sectionScores": {
    "skills": number,
    "experience": number,
    "education": number,
    "projects": number,
    "keywordsMatch": number
  },
  "missingKeywords": string[],
  "recommendations": {
    "skills": string[],
    "experience": string[],
    "education": string[],
    "projects": string[],
    "keywordsMatch": string[],
    "overall": string[]
  },
  "suggestionsToImproveATS": string[],
  "finalRecommendations": string[]
}

HARD CONSTRAINTS
- Output ONLY the JSON object (no extra keys)
- Do NOT invent skills/keywords not found in the Job Description
- missingKeywords must be short keyword phrases (lowercase preferred)
- recommendations must be specific, non-generic, and based on missing/weak areas

Resume:
${resumeText}

Job Description:
${jobDescription}`;
}

// Backward compat: older code imports buildGeminiAtsPrompt.
const buildGeminiAtsPrompt = buildAtsPrompt;

module.exports = { buildAtsPrompt, buildGeminiAtsPrompt };

