// Central error handler to keep API responses consistent.
function errorMiddleware(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err);

  const status = err.statusCode || err.status || 500;
  const message =
    err.expose === true ? err.message : status >= 500 ? "Internal server error" : err.message;

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" ? { details: err.details } : {}),
  });
}

module.exports = errorMiddleware;

