import { ZodError } from 'zod';

export function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: error.errors.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid resource id.' });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      message: 'This slot has already been booked. Please choose another time.'
    });
  }

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    message: error.message || 'Something went wrong.'
  });
}
