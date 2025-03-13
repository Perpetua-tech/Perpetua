import cors from 'cors';
import { config } from '../config';
import { logger } from '../utils/logger';

// Configure CORS options
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Get allowed origins
    const allowedOrigins = config.corsOrigin;
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if the request origin is allowed
    if (
      // If corsOrigin is a string, check if it matches or is a wildcard
      (typeof allowedOrigins === 'string' && (allowedOrigins === '*' || allowedOrigins === origin)) ||
      // If corsOrigin is a RegExp, test if it matches
      (allowedOrigins instanceof RegExp && allowedOrigins.test(origin)) ||
      // If corsOrigin is an array, check if it includes the origin
      (Array.isArray(allowedOrigins) && allowedOrigins.some(allowedOrigin => 
        (typeof allowedOrigin === 'string' && (allowedOrigin === '*' || allowedOrigin === origin)) ||
        (allowedOrigin instanceof RegExp && allowedOrigin.test(origin))
      ))
    ) {
      callback(null, true);
    } else {
      logger.warn(`CORS rejected request from ${origin}`);
      callback(new Error(`Cross-origin request from ${origin} is not allowed`));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400, // 24 hours
};

// Export configured CORS middleware
export const corsMiddleware = cors(corsOptions); 