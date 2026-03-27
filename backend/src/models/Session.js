const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    refreshTokenHash: { type: String, required: true, unique: true },

    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, default: null },

    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

SessionSchema.index({ revokedAt: 1, expiresAt: 1 });

module.exports = mongoose.model("Session", SessionSchema);

