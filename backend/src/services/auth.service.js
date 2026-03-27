const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const env = require("../config/env");
const User = require("../models/User");
const Session = require("../models/Session");
const { sha256 } = require("../utils/crypto");

function parseExpiresIn(expiresIn) {
  // Supported: "15m", "30d", "7h", "3600" (seconds)
  const s = String(expiresIn).trim();
  const numOnly = Number(s);
  if (Number.isFinite(numOnly)) return numOnly * 1000;

  const match = s.match(/^(\d+)\s*([smhd])$/i);
  if (!match) throw new Error(`Unsupported JWT expiry format: ${expiresIn}`);
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const mult = unit === "s" ? 1000 : unit === "m" ? 60 * 1000 : unit === "h" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  return value * mult;
}

function signAccessToken({ userId, sessionId }) {
  return jwt.sign(
    { sub: userId.toString(), sid: sessionId.toString() },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
  );
}

function signRefreshToken({ userId, sessionId }) {
  return jwt.sign(
    { sub: userId.toString(), sid: sessionId.toString() },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );
}

async function createSessionAndTokens({ userId, ip, userAgent }) {
  const sessionId = new mongoose.Types.ObjectId();
  const expiresAt = new Date(Date.now() + parseExpiresIn(env.JWT_REFRESH_EXPIRES_IN));
  const refreshToken = signRefreshToken({ userId, sessionId });
  const refreshTokenHash = sha256(refreshToken);

  await Session.create({
    _id: sessionId,
    userId,
    refreshTokenHash,
    expiresAt,
    ip: ip || "",
    userAgent: userAgent || "",
  });

  const accessToken = signAccessToken({ userId, sessionId });
  return { accessToken, refreshToken, sessionId };
}

async function signup({ name, email, password, ip, userAgent }) {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("Email already in use");
    err.statusCode = 409;
    err.expose = true;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  const user = await User.create({ name, email, passwordHash });
  return createSessionAndTokens({ userId: user._id, ip, userAgent });
}

async function login({ email, password, ip, userAgent }) {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    err.expose = true;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    err.expose = true;
    throw err;
  }

  return createSessionAndTokens({ userId: user._id, ip, userAgent });
}

async function refresh({ refreshToken, ip, userAgent }) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
  } catch (e) {
    const err = new Error("Invalid refresh token");
    err.statusCode = 401;
    err.expose = true;
    throw err;
  }

  const userId = payload.sub;
  const sessionId = payload.sid;
  if (!userId || !sessionId) {
    const err = new Error("Invalid refresh token payload");
    err.statusCode = 401;
    err.expose = true;
    throw err;
  }

  const refreshTokenHash = sha256(refreshToken);

  const session = await Session.findOne({
    _id: sessionId,
    userId,
    refreshTokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    const err = new Error("Refresh session not found");
    err.statusCode = 401;
    err.expose = true;
    throw err;
  }

  // Rotate refresh token (same session id) for better security.
  const expiresAt = new Date(Date.now() + parseExpiresIn(env.JWT_REFRESH_EXPIRES_IN));
  const newRefreshToken = signRefreshToken({ userId, sessionId });
  const newRefreshTokenHash = sha256(newRefreshToken);

  await Session.findByIdAndUpdate(sessionId, {
    $set: {
      refreshTokenHash: newRefreshTokenHash,
      expiresAt,
      ip: ip || session.ip,
      userAgent: userAgent || session.userAgent,
    },
  });

  const accessToken = signAccessToken({ userId, sessionId });
  return { accessToken, refreshToken: newRefreshToken };
}

async function logout({ refreshToken }) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
  } catch {
    // For logout, don't leak whether the token is valid; revoke nothing if invalid.
    return { success: true };
  }

  const sessionId = payload.sid;
  if (!sessionId) return { success: true };

  await Session.findByIdAndUpdate(sessionId, { $set: { revokedAt: new Date() } });
  return { success: true };
}

module.exports = {
  signup,
  login,
  refresh,
  logout,
};

