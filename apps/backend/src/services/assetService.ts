import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Asset creation parameters interface
interface CreateAssetParams {
  name: string;
  type: string;
  location: string;
  description: string;
  totalValue: number;
  availableAmount: number;
  minInvestment: number;
  expectedReturn: number;
  duration: number;
  imageUrl?: string;
  risk: string;
}

// Asset update parameters interface
interface UpdateAssetParams {
  name?: string;
  type?: string;
  location?: string;
  description?: string;
  totalValue?: number;
  availableAmount?: number;
  minInvestment?: number;
  expectedReturn?: number;
  duration?: number;
  imageUrl?: string;
  risk?: string;
  status?: string;
}

// Asset query parameters interface
interface AssetQueryParams {
  page?: number;
  limit?: number;
  type?: string;
  location?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

// Date filter interface
interface DateFilter {
  gte?: Date;
  lte?: Date;
}

export const assetService = {
  // Create new asset
  createAsset: async (data: CreateAssetParams) => {
    try {
      return await prisma.asset.create({
        data,
      });
    } catch (error) {
      logger.error('Failed to create asset', { error, data });
      throw error;
    }
  },

  // Update asset
  updateAsset: async (id: string, data: UpdateAssetParams) => {
    try {
      return await prisma.asset.update({
        where: { id },
        data,
      });
    } catch (error) {
      logger.error('Failed to update asset', { error, id, data });
      throw error;
    }
  },

  // Delete asset
  deleteAsset: async (id: string) => {
    try {
      return await prisma.asset.update({
        where: { id },
        data: { status: 'inactive' },
      });
    } catch (error) {
      logger.error('Failed to delete asset', { error, id });
      throw error;
    }
  },

  // Find asset by ID
  findById: async (id: string) => {
    try {
      return await prisma.asset.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error('Failed to find asset', { error, id });
      throw error;
    }
  },

  // Query asset list
  findAssets: async (params: AssetQueryParams) => {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        location,
        sortBy = 'createdAt',
        order = 'desc',
      } = params;

      const skip = (page - 1) * limit;

      // Build filter conditions
      const where: any = {
        status: 'active', // Only return active assets
      };

      if (type) {
        where.type = type;
      }

      if (location) {
        where.location = location;
      }

      // Build sort conditions
      const orderBy: any = {};
      orderBy[sortBy] = order;

      // Query assets
      const [assets, total] = await Promise.all([
        prisma.asset.findMany({
          where,
          skip,
          take: limit,
          orderBy,
        }),
        prisma.asset.count({ where }),
      ]);

      return {
        assets,
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Failed to query asset list', { error, params });
      throw error;
    }
  },

  // Get asset investors list
  getAssetInvestors: async (assetId: string, page: number = 1, limit: number = 20) => {
    try {
      const skip = (page - 1) * limit;

      // Query investors
      const [investments, total] = await Promise.all([
        prisma.investment.findMany({
          where: { assetId },
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                walletAddress: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.investment.count({ where: { assetId } }),
      ]);

      // Extract user data from investments
      const investors = investments.map((investment: any) => ({
        user: investment.user,
        investmentId: investment.id,
        amount: investment.amount,
        status: investment.status,
        investmentDate: investment.createdAt,
      }));

      return {
        investors,
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Failed to get asset investors', { error, assetId, page, limit });
      throw error;
    }
  },

  // Get asset performance metrics
  getAssetPerformance: async (assetId: string, period: string = 'all') => {
    try {
      // Build date filter conditions
      const dateFilter: DateFilter = {};
      const now = new Date();

      if (period === '1m') {
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        dateFilter.gte = oneMonthAgo;
      } else if (period === '3m') {
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        dateFilter.gte = threeMonthsAgo;
      } else if (period === '6m') {
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        dateFilter.gte = sixMonthsAgo;
      } else if (period === '1y') {
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        dateFilter.gte = oneYearAgo;
      }

      // Query performance metrics
      const performances = await prisma.performance.findMany({
        where: {
          assetId,
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
        },
        orderBy: {
          date: 'asc',
        },
      });

      // Calculate summary data
      let totalGrowth = 0;
      let averageYield = 0;

      if (performances.length > 0) {
        // Calculate total growth rate
        const firstValue = performances[0].value;
        const lastValue = performances[performances.length - 1].value;
        totalGrowth = ((lastValue - firstValue) / firstValue) * 100;

        // Calculate average yield
        averageYield = performances.reduce((sum: number, p) => sum + p.yield, 0) / performances.length;
      }

      return {
        performances,
        summary: {
          totalGrowth,
          averageYield,
          period,
          dataPoints: performances.length,
        },
      };
    } catch (error) {
      logger.error('Failed to get asset performance metrics', { error, assetId, period });
      throw error;
    }
  },

  // Add asset performance data
  addPerformanceData: async (assetId: string, data: { date: Date; value: number; growth: number; yield: number }) => {
    try {
      return await prisma.performance.create({
        data: {
          ...data,
          assetId,
        },
      });
    } catch (error) {
      logger.error('Failed to add asset performance data', { error, assetId, data });
      throw error;
    }
  },
}; 