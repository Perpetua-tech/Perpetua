import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Investment creation parameters interface
interface CreateInvestmentParams {
  userId: string;
  assetId: string;
  amount: number;
}

// Earning query parameters interface
interface EarningQueryParams {
  startDate?: Date;
  endDate?: Date;
}

export const investmentService = {
  // Create new investment
  createInvestment: async (data: CreateInvestmentParams) => {
    try {
      // Start transaction
      return await prisma.$transaction(async (tx) => {
        // 1. Check if user exists
        const user = await tx.user.findUnique({
          where: { id: data.userId }
        });

        if (!user) {
          throw new Error('User not found');
        }

        // 2. Check if asset exists and has available investment
        const asset = await tx.asset.findUnique({
          where: { id: data.assetId }
        });

        if (!asset) {
          throw new Error('Asset not found');
        }

        if (asset.status !== 'active') {
          throw new Error('Asset is not available for investment');
        }

        if (asset.availableAmount < data.amount) {
          throw new Error('Insufficient available amount in asset');
        }

        if (data.amount < asset.minInvestment) {
          throw new Error(`Minimum investment amount is ${asset.minInvestment}`);
        }

        // 3. Create investment record
        const investment = await tx.investment.create({
          data: {
            userId: data.userId,
            assetId: data.assetId,
            amount: data.amount,
            status: 'active'
          }
        });

        // 4. Update asset available amount
        await tx.asset.update({
          where: { id: data.assetId },
          data: {
            availableAmount: asset.availableAmount - data.amount
          }
        });

        // 5. Create transaction record
        const transaction = await tx.transaction.create({
          data: {
            userId: data.userId,
            type: 'invest',
            amount: data.amount,
            status: 'pending'
          }
        });

        return { investment, transaction };
      });
    } catch (error) {
      logger.error('Failed to create investment', { error, data });
      throw error;
    }
  },

  // Find investment by ID
  findById: async (id: string, userId?: string) => {
    try {
      const where: any = { id };
      
      // If userId is provided, only return user's own investment
      if (userId) {
        where.userId = userId;
      }
      
      return await prisma.investment.findFirst({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            }
          },
          asset: true,
          earnings: {
            orderBy: {
              date: 'desc'
            }
          }
        }
      });
    } catch (error) {
      logger.error('Failed to find investment', { error, id });
      throw error;
    }
  },

  // Get investment earnings
  getInvestmentEarnings: async (investmentId: string, userId: string, queryParams?: EarningQueryParams) => {
    try {
      // 1. Check if investment belongs to user
      const investment = await prisma.investment.findFirst({
        where: {
          id: investmentId,
          userId
        }
      });

      if (!investment) {
        throw new Error('Investment not found or does not belong to user');
      }

      // 2. Build query filters
      const where: any = { investmentId };
      
      if (queryParams?.startDate || queryParams?.endDate) {
        where.date = {};
        
        if (queryParams?.startDate) {
          where.date.gte = queryParams.startDate;
        }
        
        if (queryParams?.endDate) {
          where.date.lte = queryParams.endDate;
        }
      }

      // 3. Query earnings
      const earnings = await prisma.earning.findMany({
        where,
        orderBy: {
          date: 'desc'
        }
      });

      // 4. Calculate total amounts
      const totalAmount = earnings.reduce((sum, earning) => sum + earning.amount, 0);
      const paidAmount = earnings
        .filter(earning => earning.status === 'paid')
        .reduce((sum, earning) => sum + earning.amount, 0);
      const pendingAmount = totalAmount - paidAmount;

      return {
        earnings,
        summary: {
          total: totalAmount,
          paid: paidAmount,
          pending: pendingAmount
        }
      };
    } catch (error) {
      logger.error('Failed to get investment earnings', { error, investmentId });
      throw error;
    }
  },

  // Withdraw earnings
  withdrawEarnings: async (investmentId: string, userId: string) => {
    try {
      // Start transaction
      return await prisma.$transaction(async (tx) => {
        // 1. Check if investment belongs to user
        const investment = await tx.investment.findFirst({
          where: {
            id: investmentId,
            userId
          }
        });

        if (!investment) {
          throw new Error('Investment not found or does not belong to user');
        }

        // 2. Get pending earnings
        const pendingEarnings = await tx.earning.findMany({
          where: {
            investmentId,
            status: 'pending'
          }
        });

        if (pendingEarnings.length === 0) {
          throw new Error('No pending earnings to withdraw');
        }

        // 3. Calculate total amount to withdraw
        const totalAmount = pendingEarnings.reduce((sum, earning) => sum + earning.amount, 0);

        // 4. Update earnings status
        await tx.earning.updateMany({
          where: {
            id: {
              in: pendingEarnings.map(earning => earning.id)
            }
          },
          data: {
            status: 'paid'
          }
        });

        // 5. Create transaction record
        const transaction = await tx.transaction.create({
          data: {
            userId,
            type: 'withdraw_earnings',
            amount: totalAmount,
            status: 'pending'
          }
        });

        return {
          totalAmount,
          earningsCount: pendingEarnings.length,
          transaction
        };
      });
    } catch (error) {
      logger.error('Failed to withdraw earnings', { error, investmentId });
      throw error;
    }
  },

  // Redeem investment
  redeemInvestment: async (investmentId: string, userId: string) => {
    try {
      // Start transaction
      return await prisma.$transaction(async (tx) => {
        // 1. Check if investment belongs to user
        const investment = await tx.investment.findFirst({
          where: {
            id: investmentId,
            userId,
            status: 'active' // Only active investments can be redeemed
          },
          include: {
            asset: true
          }
        });

        if (!investment) {
          throw new Error('Investment not found, does not belong to user, or is not active');
        }

        // 2. Update investment status
        await tx.investment.update({
          where: { id: investmentId },
          data: {
            status: 'redeemed'
          }
        });

        // 3. Create transaction record
        const transaction = await tx.transaction.create({
          data: {
            userId,
            type: 'redeem_investment',
            amount: investment.amount,
            status: 'pending'
          }
        });

        return {
          investment,
          transaction
        };
      });
    } catch (error) {
      logger.error('Failed to redeem investment', { error, investmentId });
      throw error;
    }
  },

  // Get user investments
  getUserInvestments: async (userId: string, status?: string, page: number = 1, limit: number = 20) => {
    try {
      // Build query conditions
      const where: any = { userId };
      
      if (status) {
        where.status = status;
      }
      
      // Pagination settings
      const skip = (page - 1) * limit;
      
      // Query investments
      const [investments, total] = await Promise.all([
        prisma.investment.findMany({
          where,
          include: {
            asset: {
              select: {
                id: true,
                name: true,
                type: true,
                location: true,
                imageUrl: true,
                expectedReturn: true,
                risk: true
              }
            },
            earnings: {
              where: {
                status: 'pending'
              },
              select: {
                amount: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.investment.count({ where })
      ]);

      // Calculate total investment amount and pending earnings
      const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
      const pendingEarnings = investments.reduce((sum, inv) => {
        return sum + inv.earnings.reduce((earningSum, earning) => earningSum + earning.amount, 0);
      }, 0);

      return {
        investments,
        summary: {
          totalInvested,
          pendingEarnings,
          investmentCount: total
        },
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Failed to get user investments', { error, userId });
      throw error;
    }
  }
}; 