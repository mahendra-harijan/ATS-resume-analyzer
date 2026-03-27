const mongoose = require("mongoose");

const AnalysisReportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", required: true, index: true },

    jobDescription: { type: String, required: true },
    result: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

AnalysisReportSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("AnalysisReport", AnalysisReportSchema);

