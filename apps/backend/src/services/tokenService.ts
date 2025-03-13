import { PrismaClient } from '@prisma/client';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import logger from '../utils/logger';
import AppError from '../utils/appError';

const prisma = new PrismaClient();

// Token lock record interface
interface TokenLock {
  id: string;
  userId: string;
  amount: number;
  lockDate: Date;
  unlockDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Get Solana connection
const getSolanaConnection = () => {
  const endpoint = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  return new Connection(endpoint);
};

/**
 * Get user token balance
 */
export const getUserBalance = async (userId: string): Promise<number> => {
  try {
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        tokenBalance: true, // Assuming user model has tokenBalance field
        walletAddress: true, // Assuming user model has walletAddress field
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // If user has on-chain wallet address, try to get on-chain data
    if (user.walletAddress) {
      try {
        const onChainBalance = await getOnChainBalance(user.walletAddress);
        // Can update on-chain balance to database here
        return Math.max(user.tokenBalance || 0, onChainBalance);
      } catch (error) {
        logger.error('Failed to get on-chain balance', error);
        // If on-chain retrieval fails, fall back to database balance
      }
    }

    return user.tokenBalance || 0;
  } catch (error) {
    logger.error('Failed to get user token balance', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get user token balance', 500);
  }
};

/**
 * Get user locked tokens
 */
export const getLockedTokens = async (userId: string): Promise<TokenLock[]> => {
  try {
    // Query user locked token records, return only those not yet unlocked
    const lockedTokens = await prisma.tokenLock.findMany({
      where: {
        userId,
        unlockDate: {
          gt: new Date(), // Only get records not yet unlocked
        },
      },
    });

    return lockedTokens;
  } catch (error) {
    logger.error('Failed to get user locked tokens', error);
    throw new AppError('Failed to get user locked tokens', 500);
  }
};

/**
 * Lock user tokens
 */
export const lockTokens = async (
  userId: string,
  amount: number,
  durationInDays: number
): Promise<TokenLock> => {
  if (amount <= 0) {
    throw new AppError('Lock amount must be greater than 0', 400);
  }

  if (durationInDays <= 0) {
    throw new AppError('Lock duration must be greater than 0 days', 400);
  }

  try {
    // Check if user balance is sufficient
    const userBalance = await getUserBalance(userId);
    if (userBalance < amount) {
      throw new AppError('Insufficient token balance', 400);
    }

    // Calculate unlock date
    const unlockDate = new Date();
    unlockDate.setDate(unlockDate.getDate() + durationInDays);

    // Create lock record
    const tokenLock = await prisma.tokenLock.create({
      data: {
        userId,
        amount,
        lockDate: new Date(),
        unlockDate,
      },
    });

    // Deduct locked tokens from user balance
    await prisma.user.update({
      where: { id: userId },
      data: {
        tokenBalance: {
          decrement: amount,
        },
      },
    });

    return tokenLock;
  } catch (error) {
    logger.error('Failed to lock tokens', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to lock tokens', 500);
  }
};

/**
 * Unlock expired tokens
 */
export const unlockExpiredTokens = async (userId: string): Promise<number> => {
  try {
    // Find expired lock records
    const expiredLocks = await prisma.tokenLock.findMany({
      where: {
        userId,
        unlockDate: {
          lte: new Date(), // Already reached unlock date
        },
        status: 'LOCKED', // Assuming there's a status field indicating lock status
      },
    });

    if (expiredLocks.length === 0) {
      return 0; // No expired locks
    }

    // Calculate total amount to unlock
    const totalAmount = expiredLocks.reduce((sum, lock) => sum + lock.amount, 0);

    // Start transaction
    await prisma.$transaction(async (tx) => {
      // Update lock record status
      await Promise.all(
        expiredLocks.map((lock) =>
          tx.tokenLock.update({
            where: { id: lock.id },
            data: { status: 'UNLOCKED' },
          })
        )
      );

      // Return tokens to user balance
      await tx.user.update({
        where: { id: userId },
        data: {
          tokenBalance: {
            increment: totalAmount,
          },
        },
      });
    });

    return totalAmount;
  } catch (error) {
    logger.error('Failed to unlock tokens', error);
    throw new AppError('Failed to unlock tokens', 500);
  }
};

/**
 * Delegate voting power
 */
export const delegateVotingPower = async (
  fromUserId: string,
  toUserId: string,
  amount: number,
  expiryDate?: Date
): Promise<void> => {
  if (fromUserId === toUserId) {
    throw new AppError('Cannot delegate to yourself', 400);
  }

  if (amount <= 0) {
    throw new AppError('Delegate amount must be greater than 0', 400);
  }

  try {
    // Check if user balance is sufficient
    const userBalance = await getUserBalance(fromUserId);
    if (userBalance < amount) {
      throw new AppError('Insufficient token balance', 400);
    }

    // Check if receiving delegation user exists
    const toUser = await prisma.user.findUnique({
      where: { id: toUserId },
    });

    if (!toUser) {
      throw new AppError('Receiving delegation user not found', 404);
    }

    // Calculate expiry date (if not provided)
    const expiry = expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

    // Create delegation record
    await prisma.votingPowerDelegation.create({
      data: {
        fromUserId,
        toUserId,
        amount,
        expiryDate: expiry,
      },
    });

    // Update user balance
    await prisma.user.update({
      where: { id: fromUserId },
      data: {
        tokenBalance: {
          decrement: amount,
        },
      },
    });

    // Here you can choose whether to increase the receiving user's balance, or only consider delegation in calculating voting power
  } catch (error) {
    logger.error('Failed to delegate voting power', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to delegate voting power', 500);
  }
};

/**
 * Revoke delegation
 */
export const revokeDelegation = async (delegationId: string, userId: string): Promise<void> => {
  try {
    // Find delegation record
    const delegation = await prisma.votingPowerDelegation.findUnique({
      where: { id: delegationId },
    });

    if (!delegation) {
      throw new AppError('Delegation record not found', 404);
    }

    if (delegation.fromUserId !== userId) {
      throw new AppError('Unauthorized to revoke this delegation', 403);
    }

    // Start transaction
    await prisma.$transaction(async (tx) => {
      // Delete delegation record
      await tx.votingPowerDelegation.delete({
        where: { id: delegationId },
      });

      // Return tokens to user balance
      await tx.user.update({
        where: { id: userId },
        data: {
          tokenBalance: {
            increment: delegation.amount,
          },
        },
      });
    });
  } catch (error) {
    logger.error('Failed to revoke delegation', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to revoke delegation', 500);
  }
};

/**
 * Calculate user voting power
 */
export const calculateVotingPower = async (userId: string): Promise<number> => {
  try {
    // Get user balance
    const tokenBalance = await getUserBalance(userId);

    // Get user locked tokens
    const lockedTokens = await getLockedTokens(userId);

    // Get voting power delegated to user
    const delegationsToUser = await prisma.votingPowerDelegation.findMany({
      where: {
        toUserId: userId,
        expiryDate: {
          gt: new Date(), // Unexpired delegation
        },
      },
    });

    // Basic voting power = token balance
    let votingPower = tokenBalance;

    // Locked token additional power
    // Formula: locked token * (1 + locked time coefficient)
    const now = new Date();
    for (const lock of lockedTokens) {
      // Calculate locked remaining time (days)
      const daysRemaining = Math.max(
        0,
        (lock.unlockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      // Locked time coefficient: longest locked is 365 days, adding 0.1% weight per day
      const timeBonus = Math.min(daysRemaining / 365, 1) * 0.365; // Maximum 36.5% additional weight
      votingPower += lock.amount * (1 + timeBonus);
    }

    // Voting power delegated
    const delegatedPower = delegationsToUser.reduce((sum, delegation) => sum + delegation.amount, 0);
    votingPower += delegatedPower;

    return votingPower;
  } catch (error) {
    logger.error('Failed to calculate voting power', error);
    throw new AppError('Failed to calculate voting power', 500);
  }
};

/**
 * Get on-chain token balance
 */
const getOnChainBalance = async (walletAddress: string): Promise<number> => {
  try {
    const connection = getSolanaConnection();
    const publicKey = new PublicKey(walletAddress);
    
    // Here you need to specify the project's token mint address
    const tokenMintAddress = process.env.TOKEN_MINT_ADDRESS;
    if (!tokenMintAddress) {
      throw new Error('Missing token mint address configuration');
    }
    
    const tokenMintPublicKey = new PublicKey(tokenMintAddress);
    
    // Find token account
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      mint: tokenMintPublicKey,
    });
    
    // Calculate total balance
    let balance = 0;
    for (const { account } of tokenAccounts.value) {
      const parsedInfo = account.data.parsed.info;
      balance += parsedInfo.tokenAmount.uiAmount || 0;
    }
    
    return balance;
  } catch (error) {
    logger.error('Failed to get on-chain token balance', error);
    throw new Error(`Failed to get on-chain token balance: ${(error as Error).message}`);
  }
};

export default {
  getUserBalance,
  getLockedTokens,
  lockTokens,
  unlockExpiredTokens,
  delegateVotingPower,
  revokeDelegation,
  calculateVotingPower,
}; 