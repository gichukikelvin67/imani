
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  // MongoDB unique-index conflict, such as a duplicate email.
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A record with this information already exists.",
    });
  }

  // Mongoose document validation error.
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "The submitted information is invalid.",
    });
  }

  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    console.error("Server error:", err);
  }

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "An unexpected server error occurred."
        : err.message,
  });
}

//error handler gives frontend consistent JSON response.
//unexpected server errors are logged on the server without exposing internal details to customers