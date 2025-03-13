import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { referralService } from '../services/referralService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Referral controller with implemented business logic
export const referralController = {
  // Generate referral code for current user
  generateReferralCode: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('User not logged in', 401));
      }
      
      const userId = req.user.id;
      
      // Generate referral code using service
      const referralCode = await referralService.createReferralCode({ userId });
      
      res.status(201).json({
        status: 'success',
        message: 'Referral code generated successfully',
        data: {
          referralCode,
        },
      });
    } catch (error) {
      logger.error('Failed to generate referral code', { error });
      next(error);
    }
  },

  // Apply referral code (for new users)
  applyReferralCode: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('User not logged in', 401));
      }
      
      const { code } = req.body;
      const userId = req.user.id;
      
      if (!code) {
        return next(new AppError('Referral code is required', 400));
      }
      
      // Apply referral code using service
      const result = await referralService.applyReferralCode({
        referralCode: code,
        newUserId: userId,
      });
      
      res.status(200).json({
        status: 'success',
        message: 'Referral code applied successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Failed to apply referral code', { error });
      next(error);
    }
  },

  // Get user's referral history
  getUserReferrals: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('User not logged in', 401));
      }
      
      const userId = req.user.id;
      
      // Get referrals using service
      const referrals = await referralService.getUserReferrals(userId);
      
      res.status(200).json({
        status: 'success',
        data: {
          referrals,
        },
      });
    } catch (error) {
      logger.error('Failed to get user referrals', { error });
      next(error);
    }
  },

  // Get user's reward history
  getRewardHistory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('User not logged in', 401));
      }
      
      const userId = req.user.id;
      
      // Get all user's rewards (we'll implement pagination in the future)
      const rewards = await prisma.reward.findMany({
        where: {
          userId: userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      res.status(200).json({
        status: 'success',
        data: {
          rewards,
        },
      });
    } catch (error) {
      logger.error('Failed to get reward history', { error });
      next(error);
    }
  },

  // Validate a referral code (check if valid)
  validateReferralCode: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.params;
      
      if (!code) {
        return next(new AppError('Referral code is required', 400));
      }
      
      // Validate code using service
      const isValid = await referralService.validateReferralCode(code);
      
      res.status(200).json({
        status: 'success',
        data: {
          isValid,
        },
      });
    } catch (error) {
      logger.error('Failed to validate referral code', { error });
      next(error);
    }
  },

  // Process pending rewards (admin only)
  processRewards: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return next(new AppError('Unauthorized access', 403));
      }
      
      const userId = req.user.id; // We'll use the admin's ID for processing their rewards
      
      // Process rewards using service
      const result = await referralService.processRewards(userId);
      
      res.status(200).json({
        status: 'success',
        message: 'Rewards processed successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Failed to process rewards', { error });
      next(error);
    }
  },
}; 