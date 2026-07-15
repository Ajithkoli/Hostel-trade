const errorHandler = (err, req, res, next) => {
  // Log critical 500 errors or programming bugs
  if (!err.isOperational) {
    console.error("💥 SYSTEM ERROR / CRITICAL BUG:", err);
  } else {
    console.warn(`⚠️ Operational error [${err.statusCode || 400}]:`, err.message);
  }

  let statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || "Internal Server Error";
  let status = err.status || "error";

  // Handle specific MongoDB errors
  if (err.name === "CastError") {
    message = `Resource not found. Invalid ${err.path}`;
    statusCode = 404;
    status = "fail";
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join(". ");
    statusCode = 400;
    status = "fail";
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
    statusCode = 400;
    status = "fail";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    message = "Invalid token. Please log in again.";
    statusCode = 401;
    status = "fail";
  }

  // JWT expired error
  if (err.name === "TokenExpiredError") {
    message = "Token expired. Please log in again.";
    statusCode = 401;
    status = "fail";
  }

  res.status(statusCode).json({
    success: false,
    status,
    message,
    error: process.env.NODE_ENV === "development" ? {
      stack: err.stack,
      ...err
    } : undefined,
  });
};

export default errorHandler;
