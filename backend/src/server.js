const app = require("./app");
const env = require("./config/env");
const { connectDb } = require("./config/db");

async function start() {
  try {
    await connectDb();
  } catch (err) {
    if (env.NODE_ENV === "production") throw err;

    // eslint-disable-next-line no-console
    console.warn(
      "MongoDB connection failed; starting API in degraded mode (DB-backed routes will error).",
      err?.message || err
    );
  }

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on :${env.PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  // eslint-disable-next-line no-console
  console.error("Unhandled rejection:", err);
});

