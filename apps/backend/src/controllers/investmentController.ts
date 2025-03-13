import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { investmentService } from '../services/investmentService';
import { referralService } from '../services/referralService';

// Investment controller with implemented business logic
export const investmentController = {
  // Create new investment
  createInvestment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('User not logged in', 401));
      }
      
      const userId = req.user.id;
      const { assetId, amount } = req.body;
      
      // Basic validation
      if (!assetId || !amount) {
        return next(new AppError('Asset ID and amount are required', 400));
      }
      
      // Create investment using service
      const result = await investmentService.createInvestment({
        userId,
        assetId,
        amount: parseFloat(amount)
      });
      
      // Try to create referral reward if applicable (non-blocking)
      try {
        await referralService.createInvestmentReward(result.investment.id, parseFloat(amount));
      } catch (rewardError) {
        // Log but don't fail the request
        logger.warn('Failed to create referral reward', { error: rewardError, investmentId: result.investment.id });
      }
      
      res.status(201).json({
        status: 'success',
        message: 'Investment created successfully',
        data: result
      });
    } catch (error) {
      logger.error('Failed to create investment', { error });
      next(error);
    }
  },

  // Get investment details
  getInvestmentById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('User not logged in', 401));
      }
      
      const { id } = req.params;
      const userId = req.user.id;
      
      // Get investment using service (pass userId to ensure user only accesses their own investments)
      const investment = await investmentService.findById(id, userId);
      
      if (!investment) {
        return next(new AppError('Investment not found', 404));
      }
      
      res.status(200).json({
        status: 'success',
        data: {
          investment
        }
      });
    } catch (error) {
      logger.error('Failed to get investment details', { error });
      next(error);
    }
  },

  // Get investment earnings history
  getInvestmentEarnings: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('User not logged in', 401));
      }
      
      const { id } = req.params;
      const userId = req.user.id;
      const { startDate, endDate } = req.query;
      
      // Build query params
      const queryParams: any = {};
      
      if (startDate) {
        queryParams.startDate = new Date(startDate as string);
      }
      
      if (endDate) {
        queryParams.endDate = new Date(endDate as string);
      }
      
      // Get earnings using service
      const result = await investmentService.getInvestmentEarnings(id, userId, queryParams);
      
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      logger.error('Failed to get investment earnings history', { error });
      next(error);
    }
  },

  // Withdraw investment earnings
  withdrawEarnings: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('User not logged in', 401));
      }
      
      const { id } = req.params;
      const userId = req.user.id;
      
      // Withdraw earnings using service
      const result = await investmentService.withdrawEarnings(id, userId);
      
      res.status(200).json({
        status: 'success',
        message: 'Earnings withdrawn successfully',
        data: result
      });
    } catch (error) {
      logger.error('Failed to withdraw investment earnings', { error });
      next(error);
    }
  },

  // Redeem investment
  redeemInvestment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('User not logged in', 401));
      }
      
      const { id } = req.params;
      const userId = req.user.id;
      
      // Redeem investment using service
      const result = await investmentService.redeemInvestment(id, userId);
      
      res.status(200).json({
        status: 'success',
        message: 'Investment redeemed successfully',
        data: result
      });
    } catch (error) {
      logger.error('Failed to redeem investment', { error });
      next(error);
    }
  },
  
  // Get user investments
  getUserInvestments: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('User not logged in', 401));
      }
      
      const userId = req.user.id;
      const { status, page, limit } = req.query;
      
      // Get investments using service
      const result = await investmentService.getUserInvestments(
        userId,
        status as string,
        page ? parseInt(page as string) : undefined,
        limit ? parseInt(limit as string) : undefined
      );
      
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      logger.error('Failed to get user investments', { error });
      next(error);
    }
  }
}; 