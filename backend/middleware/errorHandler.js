/**
 * Central Express error handler — keeps API errors JSON-shaped.
 */
export function errorHandler(err, _req, res, _next) {
  // Malformed JSON body (body-parser)
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON body" });
  }

  // Mongoose bad ObjectId, etc.
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid id or data format" });
  }

  if (err.name === "ValidationError" && err.errors) {
    const first = Object.values(err.errors)[0];
    return res.status(400).json({ message: first?.message || "Validation failed" });
  }

  console.error(err);
  const status = err.statusCode || err.status || 500;
  const message =
    status === 500 ? "Something went wrong. Please try again." : err.message || "Error";
  res.status(status).json({ message });
}
