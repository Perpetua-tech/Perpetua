// Export all middleware
export * from './errorHandler';
export * from './auth';
export * from './validator';
export * from './cors';
export * from './rateLimit';

// Export a function to configure Express application middleware
import express, { Express, json, urlencoded } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsMiddleware } from './cors';
import { globalRateLimiter } from './rateLimit';
import { errorHandler } from './errorHandler';
import { logger, stream } from '../utils/logger';

/**
 * Configure Express application middleware
 * @param app Express application instance
 */
export const setupMiddleware = (app: Express): void => {
  // Security headers
  app.use(helmet());
  
  // CORS
  app.use(corsMiddleware);
  
  // Request body parsing
  app.use(json());
  app.use(urlencoded({ extended: true }));
  
  // Logging
  app.use(morgan('combined', { stream }));
  
  // Rate limiting
  app.use(globalRateLimiter);
  
  // Error handling middleware should be registered last
  app.use(errorHandler);
}; 