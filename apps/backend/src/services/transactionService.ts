import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Transaction types
export type TransactionType = 'deposit' | 'withdraw' | 'invest' | 'redeem' | 'withdraw_earnings' | 'referral_reward';

// Transaction statuses
export type TransactionStatus = 'pending' | 'completed' | 'failed';

// Create transaction parameters interface
interface CreateTransactionParams {
  userId: string;
  type: TransactionType;
  amount: number;
  status?: TransactionStatus;
  txHash?: string;
}

// Transaction filter parameters interface
interface TransactionFilterParams {
  type?: TransactionType | TransactionType[];
  status?: TransactionStatus | TransactionStatus[];
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

export const transactionService = {
  // Create new transaction
  createTransaction: async (data: CreateTransactionParams) => {
    try {
      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (!user) {
        throw new Error('User does not exist');
      }

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId: data.userId,
          type: data.type,
          amount: data.amount,
          status: data.status || 'pending',
          txHash: data.txHash,
        },
      });

      return transaction;
    } catch (error) {
      logger.error('Failed to create transaction', { error, data });
      throw error;
    }
  },

  // Update transaction status
  updateTransactionStatus: async (id: string, status: TransactionStatus, txHash?: string) => {
    try {
      // Find transaction
      const transaction = await prisma.transaction.findUnique({
        where: { id },
      });

      if (!transaction) {
        throw new Error('Transaction does not exist');
      }

      // Update transaction status
      const updatedTransaction = await prisma.transaction.update({
        where: { id },
        data: {
          status,
          txHash: txHash || transaction.txHash,
        },
      });

      return updatedTransaction;
    } catch (error) {
      logger.error('Failed to update transaction status', { error, id, status });
      throw error;
    }
  },

  // Get user transaction history
  getUserTransactions: async (userId: string, filters: TransactionFilterParams = {}) => {
    try {
      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User does not exist');
      }

      // Build query conditions
      const where: Prisma.TransactionWhereInput = {
        userId,
      };

      // Add type filtering
      if (filters.type) {
        if (Array.isArray(filters.type)) {
          where.type = { in: filters.type };
        } else {
          where.type = filters.type;
        }
      }

      // Add status filtering
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          where.status = { in: filters.status };
        } else {
          where.status = filters.status;
        }
      }

      // Add date filtering
      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        
        if (filters.startDate) {
          where.createdAt.gte = filters.startDate;
        }
        
        if (filters.endDate) {
          where.createdAt.lte = filters.endDate;
        }
      }

      // Add amount filtering
      if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
        where.amount = {};
        
        if (filters.minAmount !== undefined) {
          where.amount.gte = filters.minAmount;
        }
        
        if (filters.maxAmount !== undefined) {
          where.amount.lte = filters.maxAmount;
        }
      }

      // Pagination settings
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      // Query transaction records
      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.transaction.count({ where }),
      ]);

      return {
        data: transactions,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get user transaction history', { error, userId, filters });
      throw error;
    }
  },

  // Get transaction details
  getTransactionById: async (id: string, userId?: string) => {
    try {
      // Build query conditions
      const where: Prisma.TransactionWhereInput = { id };
      
      // If userId is provided, ensure only returning that user's transactions
      if (userId) {
        where.userId = userId;
      }

      // Query transaction
      const transaction = await prisma.transaction.findFirst({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              walletAddress: true,
            },
          },
        },
      });

      if (!transaction) {
        return null;
      }

      return transaction;
    } catch (error) {
      logger.error('Failed to get transaction details', { error, id, userId });
      throw error;
    }
  },

  // Get platform transaction statistics
  getTransactionStats: async (period?: 'day' | 'week' | 'month' | 'year') => {
    try {
      // Build date filter conditions
      let dateFilter: Prisma.TransactionWhereInput = {};
      
      if (period) {
        const now = new Date();
        const startDate = new Date();
        
        switch (period) {
          case 'day':
            startDate.setDate(now.getDate() - 1);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        dateFilter = {
          createdAt: {
            gte: startDate,
          },
        };
      }

      // Query different types of transaction totals
      const depositTotal = await prisma.transaction.aggregate({
        where: {
          type: 'deposit',
          status: 'completed',
          ...dateFilter,
        },
        _sum: {
          amount: true,
        },
      });

      const withdrawTotal = await prisma.transaction.aggregate({
        where: {
          type: 'withdraw',
          status: 'completed',
          ...dateFilter,
        },
        _sum: {
          amount: true,
        },
      });

      const investTotal = await prisma.transaction.aggregate({
        where: {
          type: 'invest',
          status: 'completed',
          ...dateFilter,
        },
        _sum: {
          amount: true,
        },
      });

      const redeemTotal = await prisma.transaction.aggregate({
        where: {
          type: 'redeem',
          status: 'completed',
          ...dateFilter,
        },
        _sum: {
          amount: true,
        },
      });

      // Query total transaction count
      const totalCount = await prisma.transaction.count({
        where: dateFilter,
      });

      // Query counts of transactions by status
      const pendingCount = await prisma.transaction.count({
        where: {
          status: 'pending',
          ...dateFilter,
        },
      });

      const completedCount = await prisma.transaction.count({
        where: {
          status: 'completed',
          ...dateFilter,
        },
      });

      const failedCount = await prisma.transaction.count({
        where: {
          status: 'failed',
          ...dateFilter,
        },
      });

      return {
        totals: {
          deposit: depositTotal._sum.amount || 0,
          withdraw: withdrawTotal._sum.amount || 0,
          invest: investTotal._sum.amount || 0,
          redeem: redeemTotal._sum.amount || 0,
          net: (depositTotal._sum.amount || 0) - (withdrawTotal._sum.amount || 0),
        },
        counts: {
          total: totalCount,
          pending: pendingCount,
          completed: completedCount,
          failed: failedCount,
        },
        period,
      };
    } catch (error) {
      logger.error('Failed to get transaction statistics', { error, period });
      throw error;
    }
  },
}; 