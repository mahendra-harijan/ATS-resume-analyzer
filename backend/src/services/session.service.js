const Session = require("../models/Session");

async function createSession({ userId, refreshTokenHash, expiresAt, ip, userAgent }) {
  const session = await Session.create({
    userId,
    refreshTokenHash,
    expiresAt,
    ip,
    userAgent,
  });
  return session;
}

async function revokeSessionById(sessionId) {
  return Session.findByIdAndUpdate(
    sessionId,
    { $set: { revokedAt: new Date() } },
    { new: true }
  );
}

module.exports = {
  createSession,
  revokeSessionById,
};

