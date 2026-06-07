const errorMiddleware = (err, req, res, next) => {
  console.error(`[Error Handler] ${err.stack || err.message}`);

  let error = { ...err };
  error.message = err.message;

  // Mongoose Bad ObjectId (CastError)
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid ID: ${err.value}`;
    error = new Error(message);
    error.statusCode = 400;
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const message = `Duplicate field value entered for ${field}`;
    error = new Error(message);
    error.statusCode = 400;
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map(val => val.message).join(", ");
    error = new Error(message);
    error.statusCode = 400;
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Please log in again.";
    error = new Error(message);
    error.statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    const message = "Your session has expired. Please log in again.";
    error = new Error(message);
    error.statusCode = 401;
  }

  const statusCode = error.statusCode || err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal Server Error",
    data: null,
    errors: err.errors || []
  });
};

module.exports = errorMiddleware;
