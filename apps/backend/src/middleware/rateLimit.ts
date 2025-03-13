import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { logger } from '../utils/logger';

/**
 * Global rate limiting middleware
 * Limits the number of requests from each IP within a specified time window
 */
export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs, // Time window, default is 1 minute
  max: config.rateLimitMax, // Maximum number of requests allowed in the time window, default is 100
  standardHeaders: true, // Return standard RateLimit headers
  legacyHeaders: false, // Disable legacy headers
  message: { status: 'error', message: 'Too many requests, please try again later' },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit triggered: ${req.ip} exceeded ${options.max} requests/minute`);
    res.status(429).json(options.message);
  },
});

/**
 * Create custom rate limiting middleware
 * @param windowMs Time window (milliseconds)
 * @param max Maximum number of requests allowed in the time window
 * @param message Custom error message
 */
export const createRateLimiter = (
  windowMs: number = 60 * 1000,
  max: number = 10,
  message: string = 'Too many requests, please try again later'
) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', message },
    handler: (req, res, next, options) => {
      logger.warn(`Custom rate limit triggered: ${req.ip} exceeded ${options.max} requests/${windowMs / 1000}s`);
      res.status(429).json(options.message);
    },
  });
}; 