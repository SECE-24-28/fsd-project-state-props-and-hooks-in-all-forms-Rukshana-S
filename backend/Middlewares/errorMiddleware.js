const errorMiddleware = (err, req, res, next) => {
  console.error(`[Error Handler] ${err.stack || err.message}`);
  
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    data: null,
    errors: err.errors || [],
  });
};

module.exports = errorMiddleware;
