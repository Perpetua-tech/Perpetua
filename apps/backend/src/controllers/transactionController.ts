import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { transactionService, TransactionType, TransactionStatus } from '../services/transactionService';

// Transaction controller with implemented business logic
export const transactionController = {
  // Get user transaction history
  getUserTransactions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('User not logged in', 401));
      }

      const userId = req.user.id;
      const {
        type,
        status,
        startDate,
        endDate,
        page,
        limit,
        sortBy,
        order,
      } = req.query;

      // Build filter parameters
      const filter: any = {
        userId,
      };

      if (type) {
        filter.type = type as string;
      }

      if (status) {
        filter.status = status as string;
      }

      if (startDate) {
        filter.startDate = new Date(startDate as string);
      }

      if (endDate) {
        filter.endDate = new Date(endDate as string);
      }

      // Get transactions from service
      const result = await transactionService.getUserTransactions({
        ...filter,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as string,
        order: order as 'asc' | 'desc',
      });

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      logger.error('Failed to get user transaction history', { error });
      next(error);
    }
  },

  // Get transaction details
  getTransactionDetails: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('User not logged in', 401));
      }

      const { id } = req.params;
      const userId = req.user.id;

      // Admins can view any transaction, users can only view their own
      const isAdmin = req.user.role === 'admin';
      const queryUserId = isAdmin ? undefined : userId;

      // Get transaction from service
      const transaction = await transactionService.getTransactionById(id, queryUserId);

      if (!transaction) {
        return next(new AppError('Transaction not found', 404));
      }

      res.status(200).json({
        status: 'success',
        data: {
          transaction,
        },
      });
    } catch (error) {
      logger.error('Failed to get transaction details', { error });
      next(error);
    }
  },

  // Create transaction (admin only)
  createTransaction: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return next(new AppError('Unauthorized', 403));
      }

      const { userId, type, amount, status, txHash } = req.body;

      // Basic validation
      if (!userId || !type || !amount) {
        return next(new AppError('User ID, type, and amount are required', 400));
      }

      // Validate transaction type
      const validTypes = ['deposit', 'withdraw', 'invest', 'redeem', 'withdraw_earnings', 'referral_reward'];
      if (!validTypes.includes(type)) {
        return next(new AppError('Invalid transaction type', 400));
      }

      // Create transaction using service
      const transaction = await transactionService.createTransaction({
        userId,
        type: type as TransactionType,
        amount: parseFloat(amount),
        status: status as TransactionStatus,
        txHash,
      });

      res.status(201).json({
        status: 'success',
        message: 'Transaction created successfully',
        data: {
          transaction,
        },
      });
    } catch (error) {
      logger.error('Failed to create transaction', { error });
      next(error);
    }
  },

  // Update transaction status (admin only)
  updateTransactionStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return next(new AppError('Unauthorized', 403));
      }

      const { id } = req.params;
      const { status, txHash } = req.body;

      // Basic validation
      if (!status) {
        return next(new AppError('Status is required', 400));
      }

      // Validate transaction status
      const validStatuses = ['pending', 'completed', 'failed'];
      if (!validStatuses.includes(status)) {
        return next(new AppError('Invalid transaction status', 400));
      }

      // Update transaction using service
      const transaction = await transactionService.updateTransactionStatus(
        id,
        status as TransactionStatus,
        txHash
      );

      if (!transaction) {
        return next(new AppError('Transaction not found', 404));
      }

      res.status(200).json({
        status: 'success',
        message: 'Transaction status updated successfully',
        data: {
          transaction,
        },
      });
    } catch (error) {
      logger.error('Failed to update transaction status', { error });
      next(error);
    }
  },

  // Get transaction statistics (admin only)
  getTransactionStats: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return next(new AppError('Unauthorized', 403));
      }

      const { 
        startDate, 
        endDate,
        type 
      } = req.query;

      // Build filter parameters
      const filter: any = {};

      if (startDate) {
        filter.startDate = new Date(startDate as string);
      }

      if (endDate) {
        filter.endDate = new Date(endDate as string);
      }

      if (type) {
        filter.type = type as string;
      }

      // Get statistics using service
      const stats = await transactionService.getTransactionStats(filter);

      res.status(200).json({
        status: 'success',
        data: {
          stats,
        },
      });
    } catch (error) {
      logger.error('Failed to get transaction statistics', { error });
      next(error);
    }
  },
}; 