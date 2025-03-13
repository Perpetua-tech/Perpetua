import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { config } from '../config';

// Custom error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    // Fix captureStackTrace error
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error status and message
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  // If it's our custom error, use its properties
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // Log error
  logger.error(
    `${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
    { error: err.stack }
  );

  // Send error response
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(config.nodeEnv === 'development' && {
      stack: err.stack,
      isOperational,
    }),
  });
}; 