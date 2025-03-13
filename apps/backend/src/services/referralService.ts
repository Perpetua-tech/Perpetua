import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '../utils/logger';
import { generateRandomString } from '../utils/helpers';

const prisma = new PrismaClient();

// Referral code creation parameters interface
interface CreateReferralCodeParams {
  userId: string;
}

// Apply referral code parameters interface
interface ApplyReferralCodeParams {
  referralCode: string;
  newUserId: string;
}

// Reward creation parameters interface
interface CreateRewardParams {
  userId: string;
  referralId: string;
  amount: number;
  type: 'signup' | 'investment' | 'other';
}

export const referralService = {
  // Create referral code for user
  createReferralCode: async ({ userId }: CreateReferralCodeParams) => {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User does not exist');
      }

      // Check if user already has a referral code
      const existingCode = await prisma.referral.findFirst({
        where: {
          referrerId: userId,
          status: 'active',
        },
      });

      if (existingCode) {
        return existingCode;
      }

      // Generate unique referral code
      let code;
      let isUnique = false;

      while (!isUnique) {
        // Generate 6-character alphanumeric random code
        code = generateRandomString(6);
        
        // Check if it already exists
        const existingCodeWithSameValue = await prisma.referral.findFirst({
          where: { code },
        });
        
        if (!existingCodeWithSameValue) {
          isUnique = true;
        }
      }

      // Create new referral code
      const referral = await prisma.referral.create({
        data: {
          code: code!,
          referrerId: userId,
          status: 'active',
        },
      });

      return referral;
    } catch (error) {
      logger.error('Failed to create referral code', { error, userId });
      throw error;
    }
  },

  // Apply referral code (used when new user registers)
  applyReferralCode: async ({ referralCode, newUserId }: ApplyReferralCodeParams) => {
    try {
      // Start transaction
      return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. Validate referral code
        const referral = await tx.referral.findFirst({
          where: {
            code: referralCode,
            status: 'active',
          },
          include: {
            referrer: true,
          },
        });

        if (!referral) {
          throw new Error('Invalid referral code');
        }

        // Check that a user is not referring themselves
        if (referral.referrerId === newUserId) {
          throw new Error('Cannot use your own referral code');
        }

        // 2. Update referral relationship
        await tx.referral.update({
          where: { id: referral.id },
          data: {
            refereeId: newUserId,
            appliedAt: new Date(),
          },
        });

        // 3. Create signup reward
        // Can set fixed amount or percentage reward
        const signupRewardAmount = 10; // Assume signup reward is 10 units
        const reward = await tx.reward.create({
          data: {
            referralId: referral.id,
            userId: referral.referrerId,
            amount: signupRewardAmount,
            type: 'signup',
            status: 'pending',
          },
        });

        return {
          referral,
          reward,
          referrer: {
            id: referral.referrer.id,
            username: referral.referrer.username,
          },
        };
      });
    } catch (error) {
      logger.error('Failed to apply referral code', { error, referralCode, newUserId });
      throw error;
    }
  },

  // Create investment reward (when referred user makes an investment)
  createInvestmentReward: async (investmentId: string, amount: number) => {
    try {
      // Start transaction
      return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. Get investment information
        const investment = await tx.investment.findUnique({
          where: { id: investmentId },
          include: {
            user: true,
          },
        });

        if (!investment) {
          throw new Error('Investment does not exist');
        }

        // 2. Check if this user was referred through a referral
        const referral = await tx.referral.findFirst({
          where: {
            refereeId: investment.userId,
            status: 'active',
          },
        });

        if (!referral) {
          // No referral relationship, don't create reward
          return null;
        }

        // 3. Calculate reward amount (e.g.: 5% of investment amount)
        const rewardRate = 0.05;
        const rewardAmount = amount * rewardRate;

        // 4. Create reward record
        const reward = await tx.reward.create({
          data: {
            referralId: referral.id,
            userId: referral.referrerId,
            amount: rewardAmount,
            type: 'investment',
            status: 'pending',
          },
        });

        return reward;
      });
    } catch (error) {
      logger.error('Failed to create investment reward', { error, investmentId, amount });
      throw error;
    }
  },

  // Process reward payments
  processRewards: async (userId: string) => {
    try {
      // Start transaction
      return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. Find all pending rewards for the user
        const pendingRewards = await tx.reward.findMany({
          where: {
            userId,
            status: 'pending',
          },
        });

        if (pendingRewards.length === 0) {
          return {
            processed: 0,
            totalAmount: 0,
          };
        }

        // 2. Calculate total reward amount
        const totalAmount = pendingRewards.reduce((sum: number, reward: any) => sum + reward.amount, 0);

        // 3. Update all rewards status to paid
        await tx.reward.updateMany({
          where: {
            id: {
              in: pendingRewards.map((reward: any) => reward.id),
            },
          },
          data: {
            status: 'paid',
            paidAt: new Date(),
          },
        });

        // 4. Create transaction record
        await tx.transaction.create({
          data: {
            userId,
            type: 'referral_reward',
            amount: totalAmount,
            status: 'completed',
          },
        });

        return {
          processed: pendingRewards.length,
          totalAmount,
          rewards: pendingRewards,
        };
      });
    } catch (error) {
      logger.error('Failed to process reward payments', { error, userId });
      throw error;
    }
  },

  // Get user's referral data
  getUserReferrals: async (userId: string) => {
    try {
      // 1. Get user's referral codes
      const referralCodes = await prisma.referral.findMany({
        where: {
          referrerId: userId,
        },
        include: {
          referee: {
            select: {
              id: true,
              username: true,
              createdAt: true,
            },
          },
        },
      });

      // 2. Get user's reward records
      const rewards = await prisma.reward.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // 3. Calculate statistics
      const totalReferrals = referralCodes.filter((ref: any) => ref.refereeId).length;
      const pendingRewardsAmount = rewards
        .filter((reward: any) => reward.status === 'pending')
        .reduce((sum: number, reward: any) => sum + reward.amount, 0);
      const paidRewardsAmount = rewards
        .filter((reward: any) => reward.status === 'paid')
        .reduce((sum: number, reward: any) => sum + reward.amount, 0);

      // 4. Get the currently active referral code
      const activeReferralCode = referralCodes.find((ref: any) => ref.status === 'active')?.code || null;

      return {
        referrals: referralCodes,
        rewards,
        stats: {
          totalReferrals,
          pendingRewardsAmount,
          paidRewardsAmount,
          totalRewardsAmount: pendingRewardsAmount + paidRewardsAmount,
        },
        activeReferralCode,
      };
    } catch (error) {
      logger.error('Failed to get user referral data', { error, userId });
      throw error;
    }
  },
  
  // Check if referral code is valid
  validateReferralCode: async (code: string) => {
    try {
      const referral = await prisma.referral.findFirst({
        where: {
          code,
          status: 'active',
        },
        include: {
          referrer: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      if (!referral) {
        return {
          valid: false,
          message: 'Invalid referral code',
        };
      }

      return {
        valid: true,
        referrer: {
          id: referral.referrer.id,
          username: referral.referrer.username,
        },
      };
    } catch (error) {
      logger.error('Failed to validate referral code', { error, code });
      throw error;
    }
  },
}; 