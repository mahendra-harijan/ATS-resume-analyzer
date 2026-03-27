const { z } = require("zod");

const scoreSchema = z.coerce.number().int().min(0).max(100);

const atsAnalysisSchema = z
  .object({
    overallScore: scoreSchema,
    sectionScores: z.object({
      skills: scoreSchema,
      experience: scoreSchema,
      education: scoreSchema,
      projects: scoreSchema,
      keywordsMatch: scoreSchema,
    }),
    missingKeywords: z.array(z.string().min(1)).max(200),
    recommendations: z.object({
      skills: z.array(z.string().min(1)).max(15),
      experience: z.array(z.string().min(1)).max(15),
      education: z.array(z.string().min(1)).max(15),
      projects: z.array(z.string().min(1)).max(15),
      keywordsMatch: z.array(z.string().min(1)).max(15),
      overall: z.array(z.string().min(1)).max(20),
    }),
    suggestionsToImproveATS: z.array(z.string().min(1)).max(25),
    finalRecommendations: z.array(z.string().min(1)).max(20),
  })
  .strip();

module.exports = { atsAnalysisSchema };

