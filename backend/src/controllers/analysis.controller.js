const { z } = require("zod");

const env = require("../config/env");
const Resume = require("../models/Resume");
const AnalysisReport = require("../models/AnalysisReport");
const { extractTextFromResume } = require("../services/resumeParser.service");
const { scoreResumeAgainstJob } = require("../services/atsScoring.service");
const mongoose = require("mongoose");

const analyzeSchema = z.object({
  jobDescription: z.string().min(20).max(20000),
});

async function analyze(req, res) {
  const parsed = analyzeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid request data" });

  if (!req.file) return res.status(400).json({ success: false, message: "Resume file is required" });
  const { jobDescription } = parsed.data;

  const mimeType = req.file.mimetype;
  if (!env.FILE_ALLOWED_MIMETYPES.includes(mimeType)) {
    return res.status(415).json({ success: false, message: "Unsupported resume mime type" });
  }

  // 1) Extract resume text
  const extractedText = await extractTextFromResume({
    buffer: req.file.buffer,
    mimeType,
  });

  // 2) Save resume metadata/text for future re-analysis / auditing.
  const resumeDoc = await Resume.create({
    userId: req.user.userId,
    filename: req.file.originalname,
    mimeType,
    extractedText,
  });

  // 3) Call Gemini to get ATS scoring JSON and validate it.
  const result = await scoreResumeAgainstJob({
    resumeText: extractedText,
    jobDescription,
  });

  // 4) Store analysis report history.
  const report = await AnalysisReport.create({
    userId: req.user.userId,
    resumeId: resumeDoc._id,
    jobDescription,
    result,
  });

  return res.status(201).json({
    success: true,
    report: {
      reportId: report._id,
      overallScore: result.overallScore,
      sectionScores: result.sectionScores,
      missingKeywords: result.missingKeywords,
      recommendations: result.recommendations,
      suggestionsToImproveATS: result.suggestionsToImproveATS,
      finalRecommendations: result.finalRecommendations,
      createdAt: report.createdAt,
    },
  });
}

async function history(req, res) {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
  const skip = (page - 1) * limit;

  const reports = await AnalysisReport.find({ userId: req.user.userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({ path: "resumeId", select: "filename mimeType" });

  return res.json({
    success: true,
    page,
    limit,
    items: reports.map((r) => ({
      reportId: r._id,
      createdAt: r.createdAt,
      filename: r.resumeId?.filename,
      overallScore: r.result?.overallScore ?? null,
    })),
  });
}

async function getReport(req, res) {
  const reportId = req.params.reportId;

  const report = await AnalysisReport.findOne({ _id: reportId, userId: req.user.userId }).populate({
    path: "resumeId",
    select: "filename mimeType",
  });

  if (!report) return res.status(404).json({ success: false, message: "Report not found" });

  return res.json({
    success: true,
    report: {
      reportId: report._id,
      resumeId: report.resumeId?._id,
      filename: report.resumeId?.filename,
      createdAt: report.createdAt,
      jobDescription: report.jobDescription,
      result: report.result,
    },
  });
}

async function deleteReport(req, res) {
  const reportId = req.params.reportId;
  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    return res.status(400).json({ success: false, message: "Invalid report id" });
  }

  const deleted = await AnalysisReport.findOneAndDelete({ _id: reportId, userId: req.user.userId }).select("_id");
  if (!deleted) return res.status(404).json({ success: false, message: "Report not found" });

  return res.json({ success: true, reportId: deleted._id });
}

module.exports = { analyze, history, getReport, deleteReport };

