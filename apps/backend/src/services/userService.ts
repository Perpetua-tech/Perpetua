import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// User creation parameters interface
interface CreateUserParams {
  username: string;
  email: string;
  password: string;
  walletAddress?: string;
  role?: string;
  referralCode?: string;
}

// User update parameters interface
interface UpdateUserParams {
  username?: string;
  email?: string;
  walletAddress?: string;
  role?: string;
  isActive?: boolean;
}

// User filter parameters interface
interface UserFilterParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const userService = {
  // Create a new user
  createUser: async (params: CreateUserParams) => {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(params.password, salt);
      
      // Create user
      const user = await prisma.user.create({
        data: {
          username: params.username,
          email: params.email,
          password: hashedPassword,
          walletAddress: params.walletAddress,
          role: params.role || 'user',
          isActive: true,
        },
      });
      
      // If referral code provided, apply it
      if (params.referralCode) {
        try {
          // This would be handled by referralService in a real implementation
          // await referralService.applyReferralCode({
          //   referralCode: params.referralCode,
          //   newUserId: user.id,
          // });
        } catch (referralError) {
          logger.warn('Failed to apply referral code during registration', { 
            error: referralError, 
            userId: user.id, 
            referralCode: params.referralCode 
          });
        }
      }
      
      return user;
    } catch (error) {
      logger.error('Failed to create user', { error, params });
      throw error;
    }
  },
  
  // Find user by wallet address
  findByWalletAddress: async (walletAddress: string) => {
    try {
      return await prisma.user.findUnique({
        where: { walletAddress },
      });
    } catch (error) {
      logger.error('Failed to find user by wallet address', { error, walletAddress });
      throw error;
    }
  },
  
  // Find user by ID
  getUserById: async (id: string) => {
    try {
      return await prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error('Failed to find user by ID', { error, id });
      throw error;
    }
  },
  
  // Find user by email
  findByEmail: async (email: string) => {
    try {
      return await prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      logger.error('Failed to find user by email', { error, email });
      throw error;
    }
  },
  
  // Authenticate user with email and password
  authenticateUser: async (email: string, password: string) => {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });
      
      if (!user) {
        return null;
      }
      
      // Check if password matches
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return null;
      }
      
      return user;
    } catch (error) {
      logger.error('Failed to authenticate user', { error, email });
      throw error;
    }
  },
  
  // Update user
  updateUser: async (id: string, params: UpdateUserParams) => {
    try {
      return await prisma.user.update({
        where: { id },
        data: params,
      });
    } catch (error) {
      logger.error('Failed to update user', { error, id, params });
      throw error;
    }
  },
  
  // Change user password
  changePassword: async (id: string, currentPassword: string, newPassword: string) => {
    try {
      // Get user
      const user = await prisma.user.findUnique({
        where: { id },
      });
      
      if (!user) {
        return false;
      }
      
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      
      if (!isMatch) {
        return false;
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update password
      await prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to change password', { error, id });
      throw error;
    }
  },
  
  // Get user dashboard data
  getUserDashboard: async (userId: string) => {
    try {
      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Get user investments
      const investments = await prisma.investment.findMany({
        where: { userId },
        include: {
          asset: true,
        },
      });
      
      // Get user transactions
      const transactions = await prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
      
      // Calculate total invested
      const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
      
      // Calculate total earnings
      const earnings = await prisma.earning.findMany({
        where: {
          investment: {
            userId,
          },
        },
      });
      
      const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0);
      
      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          walletAddress: user.walletAddress,
        },
        stats: {
          totalInvested,
          totalEarnings,
          activeInvestments: investments.filter(inv => inv.status === 'active').length,
          totalInvestments: investments.length,
        },
        recentTransactions: transactions,
        investments: investments.map(inv => ({
          id: inv.id,
          assetName: inv.asset.name,
          amount: inv.amount,
          status: inv.status,
          createdAt: inv.createdAt,
        })),
      };
    } catch (error) {
      logger.error('Failed to get user dashboard', { error, userId });
      throw error;
    }
  },
  
  // Get all users (admin)
  getAllUsers: async (filter: UserFilterParams) => {
    try {
      const page = filter.page || 1;
      const limit = filter.limit || 10;
      const skip = (page - 1) * limit;
      
      // Build where clause
      const where: any = {};
      
      if (filter.search) {
        where.OR = [
          { username: { contains: filter.search } },
          { email: { contains: filter.search } },
          { walletAddress: { contains: filter.search } },
        ];
      }
      
      // Get users
      const users = await prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      
      // Get total count
      const total = await prisma.user.count({ where });
      
      return {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Failed to get all users', { error, filter });
      throw error;
    }
  },
}; 