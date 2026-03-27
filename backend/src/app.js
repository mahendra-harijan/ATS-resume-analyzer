const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const path = require("path");

const env = require("./config/env");
const apiRoutes = require("./routes");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

const corsOptions = {
  // In development we allow any origin (and reflect it back) to avoid
  // localhost/127.0.0.1/port mismatch issues while developing.
  origin: env.NODE_ENV === "production" ? env.CLIENT_ORIGIN : true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 400,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Serve generated artifacts (PDF/HTML/TeX)
app.use("/generated", express.static(path.join(__dirname, "generated")));

app.use("/api", apiRoutes);

app.use(errorMiddleware);

module.exports = app;

