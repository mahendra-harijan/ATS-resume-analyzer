const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    filename: { type: String, required: true },
    mimeType: { type: String, required: true },

    extractedText: { type: String, required: true, text: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", ResumeSchema);

