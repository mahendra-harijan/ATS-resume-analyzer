const mongoose = require("mongoose");

// If Mongo isn't connected, fail fast on queries instead of hanging.
mongoose.set("bufferCommands", false);

const { MONGODB_URI } = require("./env");

async function connectDb(uri = MONGODB_URI) {
  // Keep connection options minimal; mongoose handles defaults.
  await mongoose.connect(uri);
}

module.exports = { connectDb };

