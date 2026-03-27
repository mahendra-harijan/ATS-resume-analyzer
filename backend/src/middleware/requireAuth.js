const jwt = require("jsonwebtoken");

const env = require("../config/env");
const Session = require("../models/Session");

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || typeof header !== "string") {
      return res.status(401).json({ success: false, message: "Missing Authorization header" });
    }

    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ success: false, message: "Invalid Authorization header" });
    }

    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const userId = payload.sub;
    const sessionId = payload.sid;

    if (!userId || !sessionId) {
      return res.status(401).json({ success: false, message: "Invalid token payload" });
    }

    // Enforce server-side session state so logout immediately invalidates the access token.
    const session = await Session.findById(sessionId).select("revokedAt expiresAt userId");
    if (!session || session.userId.toString() !== userId.toString()) {
      return res.status(401).json({ success: false, message: "Session not found" });
    }
    if (session.revokedAt) {
      return res.status(401).json({ success: false, message: "Session revoked" });
    }
    if (session.expiresAt && session.expiresAt.getTime() < Date.now()) {
      return res.status(401).json({ success: false, message: "Session expired" });
    }

    req.user = { userId, sessionId };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}

module.exports = requireAuth;

