function normalizeStatus(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 500;
  if (n < 400) return 500;
  if (n > 599) return 500;
  return n;
}

function isPlainObject(v) {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

function pickDevExtras(err) {
  const extras = {};
  if (err?.stack) extras.stack = err.stack;
  if (err?.name) extras.name = err.name;
  return Object.keys(extras).length ? extras : undefined;
}

// Central error handler to keep API responses consistent.
function errorMiddleware(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err);

  const isDev = process.env.NODE_ENV === "development";

  let status = normalizeStatus(err?.statusCode || err?.status || 500);
  let expose = err?.expose === true;
  let code = err?.code;
  let details = err?.details;

  // Express JSON/body parser errors (invalid JSON)
  if (err?.type === "entity.parse.failed" || err instanceof SyntaxError) {
    status = 400;
    expose = true;
    code = code || "BAD_JSON";
  }

  // Mongoose / Mongo errors
  if (err?.name === "ValidationError") {
    status = 400;
    expose = true;
    code = code || "VALIDATION_ERROR";
    if (!details && isPlainObject(err.errors)) {
      details = Object.fromEntries(
        Object.entries(err.errors).map(([k, v]) => [k, { message: v?.message }])
      );
    }
  }
  if (err?.name === "CastError") {
    status = 400;
    expose = true;
    code = code || "CAST_ERROR";
  }
  if (err?.code === 11000) {
    status = 409;
    expose = true;
    code = code || "DUPLICATE_KEY";
  }

  // Respect explicit status for known 4xx errors.
  if (status >= 400 && status < 500) expose = true;

  const message = expose
    ? String(err?.message || "Request failed")
    : status >= 500
      ? "Internal server error"
      : String(err?.message || "Request failed");

  res.status(status).json({
    success: false,
    message,
    ...(code ? { code } : {}),
    ...(isDev ? { ...(details !== undefined ? { details } : {}), ...(pickDevExtras(err) || {}) } : {}),
  });
}

module.exports = errorMiddleware;

