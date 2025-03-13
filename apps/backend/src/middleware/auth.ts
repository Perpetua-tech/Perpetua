import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from './errorHandler';
import { logger } from '../utils/logger';

// Extend Express Request type to add user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        walletAddress: string;
        role: string;
      };
    }
  }
}

/**
 * JWT token verification middleware
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from request header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication token not provided', 401));
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next(new AppError('Valid authentication token not provided', 401));
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret) as {
        id: string;
        walletAddress: string;
        role: string;
      };
      
      // Add user info to request object
      req.user = decoded;
      
      next();
    } catch (error) {
      logger.error('Token verification failed', { error });
      return next(new AppError('Invalid authentication token', 401));
    }
  } catch (error) {
    logger.error('Authentication middleware error', { error });
    return next(new AppError('Error occurred during authentication', 500));
  }
};

/**
 * Role authorization middleware
 * @param roles Array of roles allowed to access
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized access', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions for this operation', 403));
    }
    
    next();
  };
};

/**
 * Admin privilege verification middleware
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Unauthorized access', 401));
  }
  
  if (req.user.role !== 'admin') {
    return next(new AppError('Admin privileges required', 403));
  }
  
  next();
}; 