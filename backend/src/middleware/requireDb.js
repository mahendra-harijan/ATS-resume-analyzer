const mongoose = require("mongoose");

function requireDb(req, res, next) {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const connected = mongoose.connection.readyState === 1;
  if (connected) return next();

  const err = new Error("Database unavailable. Start MongoDB or set MONGODB_URI.");
  err.statusCode = 503;
  err.expose = true;
  return next(err);
}

module.exports = requireDb;
