import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { userService } from '../services/userService';
import { generateToken } from '../utils/auth';

// User controller with implemented business logic
export const userController = {
  // Register a new user
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password, walletAddress, referralCode } = req.body;

      // Basic validation
      if (!username || !email || !password) {
        return next(new AppError('Username, email, and password are required', 400));
      }

      // Create user using service
      const user = await userService.createUser({
        username,
        email,
        password,
        walletAddress,
        referralCode,
      });

      // Generate JWT token
      const token = generateToken(user);

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            walletAddress: user.walletAddress,
            role: user.role,
            createdAt: user.createdAt,
          },
          token,
        },
      });
    } catch (error) {
      logger.error('Failed to register user', { error });
      next(error);
    }
  },

  // Login user
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Basic validation
      if (!email || !password) {
        return next(new AppError('Email and password are required', 400));
      }

      // Authenticate user using service
      const user = await userService.authenticateUser(email, password);

      if (!user) {
        return next(new AppError('Invalid email or password', 401));
      }

      // Generate JWT token
      const token = generateToken(user);

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            walletAddress: user.walletAddress,
            role: user.role,
            createdAt: user.createdAt,
          },
          token,
        },
      });
    } catch (error) {
      logger.error('Failed to login user', { error });
      next(error);
    }
  },

  // Get current user profile
  getProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('User not logged in', 401));
      }

      const userId = req.user.id;

      // Get user profile using service
      const user = await userService.getUserById(userId);

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            walletAddress: user.walletAddress,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to get user profile', { error });
      next(error);
    }
  },

  // Update user profile
  updateProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('User not logged in', 401));
      }

      const userId = req.user.id;
      const { username, email, walletAddress } = req.body;

      // Update user using service
      const user = await userService.updateUser(userId, {
        username,
        email,
        walletAddress,
      });

      res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            walletAddress: user.walletAddress,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to update user profile', { error });
      next(error);
    }
  },

  // Change password
  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('User not logged in', 401));
      }

      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      // Basic validation
      if (!currentPassword || !newPassword) {
        return next(new AppError('Current password and new password are required', 400));
      }

      // Change password using service
      const success = await userService.changePassword(userId, currentPassword, newPassword);

      if (!success) {
        return next(new AppError('Current password is incorrect', 400));
      }

      res.status(200).json({
        status: 'success',
        message: 'Password changed successfully',
      });
    } catch (error) {
      logger.error('Failed to change password', { error });
      next(error);
    }
  },

  // Get user dashboard data
  getDashboard: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('User not logged in', 401));
      }

      const userId = req.user.id;

      // Get dashboard data using service
      const dashboardData = await userService.getUserDashboard(userId);

      res.status(200).json({
        status: 'success',
        data: dashboardData,
      });
    } catch (error) {
      logger.error('Failed to get user dashboard', { error });
      next(error);
    }
  },

  // Admin: Get all users
  getAllUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return next(new AppError('Unauthorized', 403));
      }

      const { page, limit, search } = req.query;

      // Get users using service
      const users = await userService.getAllUsers({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
      });

      res.status(200).json({
        status: 'success',
        data: users,
      });
    } catch (error) {
      logger.error('Failed to get all users', { error });
      next(error);
    }
  },

  // Admin: Get user by ID
  getUserById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return next(new AppError('Unauthorized', 403));
      }

      const { id } = req.params;

      // Get user using service
      const user = await userService.getUserById(id);

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      res.status(200).json({
        status: 'success',
        data: {
          user,
        },
      });
    } catch (error) {
      logger.error('Failed to get user by ID', { error });
      next(error);
    }
  },

  // Admin: Update user
  updateUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return next(new AppError('Unauthorized', 403));
      }

      const { id } = req.params;
      const { username, email, walletAddress, role, isActive } = req.body;

      // Update user using service
      const user = await userService.updateUser(id, {
        username,
        email,
        walletAddress,
        role,
        isActive,
      });

      res.status(200).json({
        status: 'success',
        message: 'User updated successfully',
        data: {
          user,
        },
      });
    } catch (error) {
      logger.error('Failed to update user', { error });
      next(error);
    }
  },
}; 