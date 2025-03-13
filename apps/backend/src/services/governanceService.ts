import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

interface CreateProposalParams {
  title: string;
  description: string;
  options: string[];
  endDate: Date;
  userId: string;
  category?: string;
  tags?: string;
}

interface VoteParams {
  proposalId: string;
  optionId: string;
  userId: string;
}

/**
 * Create a new governance proposal
 */
export const createProposal = async (
  userId: string,
  title: string,
  description: string,
  options: { text: string }[],
  endDate: Date,
  category?: string,
  tags?: string
) => {
  try {
    logger.info('Creating new governance proposal', { userId, title });
    
    // Check if user has enough voting power to create a proposal
    const userVotingPower = await getVotingPower(userId);
    
    if (userVotingPower < 100) {
      throw new AppError('Insufficient voting power to create a proposal. Minimum 100 required.', 403);
    }
    
    // Create proposal with options
    const proposal = await prisma.governanceProposal.create({
      data: {
        title,
        description,
        category,
        tags,
        creatorId: userId,
        endDate,
        options: {
          create: options.map(option => ({
            text: option.text,
            voteCount: 0
          }))
        }
      },
      include: {
        options: true,
        creator: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    logger.info('Governance proposal created successfully', { proposalId: proposal.id });
    
    return proposal;
  } catch (error) {
    logger.error('Error creating governance proposal', { error, userId, title });
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create governance proposal', 500);
  }
};

/**
 * Get all governance proposals with pagination
 */
export const getProposals = async (
  page = 1,
  limit = 10,
  status?: 'active' | 'completed' | 'all',
  userId?: string,
  category?: string
) => {
  try {
    const skip = (page - 1) * limit;
    
    // Filter by status if provided
    const where = status && status !== 'all' 
      ? status === 'active' 
        ? { endDate: { gt: new Date() } } 
        : { endDate: { lte: new Date() } }
      : {};
    
    if (category) {
      where.category = category;
    }
    
    // Get proposals with count
    const [proposals, total] = await Promise.all([
      prisma.governanceProposal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          options: {
            select: {
              id: true,
              text: true,
              voteCount: true
            }
          },
          creator: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: { votes: true }
          },
          ...(userId ? {
            votes: {
              where: {
                userId
              },
              select: {
                optionId: true,
                votingPower: true
              }
            }
          } : {})
        }
      }),
      prisma.governanceProposal.count({ where })
    ]);
    
    // Calculate total pages
    const totalPages = Math.ceil(total / limit);
    
    // Reformat proposals
    const formattedProposals = proposals.map(proposal => ({
      ...proposal,
      userVote: proposal.votes?.[0] || null,
      votes: undefined
    }));
    
    return {
      data: formattedProposals,
      meta: {
        total,
        page,
        limit,
        totalPages
      }
    };
  } catch (error) {
    logger.error('Error fetching governance proposals', { error, page, limit, status, userId, category });
    throw new AppError('Failed to fetch governance proposals', 500);
  }
};

/**
 * Get a single governance proposal by ID
 */
export const getProposalById = async (proposalId: string, userId?: string) => {
  try {
    const proposal = await prisma.governanceProposal.findUnique({
      where: { id: proposalId },
      include: {
        options: {
          select: {
            id: true,
            text: true,
            voteCount: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true
          }
        },
        votes: {
          select: {
            id: true,
            optionId: true,
            votingPower: true,
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: { votes: true }
        },
        ...(userId ? {
          votes: {
            where: {
              userId
            },
            select: {
              optionId: true,
              votingPower: true
            }
          }
        } : {})
      }
    });
    
    if (!proposal) {
      throw new AppError('Governance proposal not found', 404);
    }
    
    // Calculate total votes
    const totalVotes = proposal.votes.reduce((sum, vote) => sum + vote.votingPower, 0);
    
    // Calculate percentages for each option
    const optionsWithPercentage = proposal.options.map(option => ({
      ...option,
      percentage: totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0
    }));
    
    // Check if proposal is active
    const isActive = new Date(proposal.endDate) > new Date();
    
    return {
      ...proposal,
      options: optionsWithPercentage,
      totalVotes,
      isActive,
      userVote: proposal.votes?.[0] || null,
      votes: undefined
    };
  } catch (error) {
    logger.error('Error fetching governance proposal', { error, proposalId, userId });
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to fetch governance proposal', 500);
  }
};

/**
 * Vote on a governance proposal
 */
export const voteOnProposal = async (
  userId: string,
  proposalId: string,
  optionId: string
) => {
  try {
    // Start transaction
    return await prisma.$transaction(async (tx) => {
      // Get proposal
      const proposal = await tx.governanceProposal.findUnique({
        where: { id: proposalId },
        include: {
          options: true
        }
      });
      
      if (!proposal) {
        throw new AppError('Governance proposal not found', 404);
      }
      
      // Check if proposal is still active
      if (new Date(proposal.endDate) <= new Date()) {
        throw new AppError('Voting period for this proposal has ended', 400);
      }
      
      // Check if option exists
      const option = proposal.options.find(opt => opt.id === optionId);
      if (!option) {
        throw new AppError('Invalid voting option', 400);
      }
      
      // Check if user has already voted
      const existingVote = await tx.governanceVote.findFirst({
        where: {
          userId,
          proposalId
        }
      });
      
      if (existingVote) {
        throw new AppError('You have already voted on this proposal', 400);
      }
      
      // Get user's voting power
      const votingPower = await getVotingPower(userId);
      
      if (votingPower <= 0) {
        throw new AppError('You do not have any voting power', 400);
      }
      
      // Create vote
      const vote = await tx.governanceVote.create({
        data: {
          userId,
          proposalId,
          optionId,
          votingPower
        }
      });
      
      // Update option vote count
      await tx.governanceOption.update({
        where: { id: optionId },
        data: {
          voteCount: {
            increment: votingPower
          }
        }
      });
      
      logger.info('Vote cast successfully', { userId, proposalId, optionId, votingPower });
      
      return vote;
    });
  } catch (error) {
    logger.error('Error voting on proposal', { error, userId, proposalId, optionId });
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to cast vote', 500);
  }
};

/**
 * Get user voting power
 */
export const getVotingPower = async (userId: string) => {
  try {
    // Import tokenService to calculate voting power
    const tokenService = await import('./tokenService');
    
    // Use tokenService's calculateVotingPower method to calculate user voting power
    const votingPower = await tokenService.calculateVotingPower(userId);
    
    // Floor the voting power to ensure it's an integer
    return Math.floor(votingPower);
  } catch (error) {
    logger.error('Failed to get voting power', { error, userId });
    throw new AppError('Failed to get voting power', 500);
  }
};

/**
 * Get voting power breakdown for a user
 */
export const getVotingPowerBreakdown = async (userId: string) => {
  try {
    // Get user's investments
    const investments = await prisma.investment.findMany({
      where: {
        userId,
        status: 'ACTIVE'
      }
    });
    
    // Calculate total investment amount
    const totalInvestment = investments.reduce((sum, inv) => sum + inv.amount, 0);
    
    // Get user account age in days
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    const accountAgeInDays = Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Get user's previous votes count
    const previousVotesCount = await prisma.governanceVote.count({
      where: { userId }
    });
    
    // Calculate voting power components
    const investmentPower = Math.floor(totalInvestment / 100);
    const agePower = Math.min(Math.floor(accountAgeInDays / 30), 10);
    const activityPower = Math.min(Math.floor(previousVotesCount / 5), 5);
    
    // Total voting power
    const totalVotingPower = investmentPower + agePower + activityPower;
    
    return {
      totalVotingPower,
      breakdown: {
        investmentPower: {
          value: investmentPower,
          details: `Based on $${totalInvestment.toFixed(2)} total investment`
        },
        accountAgePower: {
          value: agePower,
          details: `Based on ${accountAgeInDays} days account age`
        },
        activityPower: {
          value: activityPower,
          details: `Based on ${previousVotesCount} previous votes`
        }
      }
    };
  } catch (error) {
    logger.error('Error getting voting power breakdown', { error, userId });
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get voting power breakdown', 500);
  }
};

/**
 * Get user's voting history
 */
export const getUserVotingHistory = async (userId: string, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    // Get votes with proposal details
    const [votes, total] = await Promise.all([
      prisma.governanceVote.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          proposal: {
            select: {
              id: true,
              title: true,
              endDate: true
            }
          },
          option: {
            select: {
              id: true,
              text: true
            }
          }
        }
      }),
      prisma.governanceVote.count({ where: { userId } })
    ]);
    
    // Calculate total pages
    const totalPages = Math.ceil(total / limit);
    
    return {
      votes,
      total,
      page,
      limit,
      totalPages
    };
  } catch (error) {
    logger.error('Error fetching user voting history', { error, userId });
    throw new AppError('Failed to fetch voting history', 500);
  }
};

export const getCategories = async () => {
  try {
    // Get all unique categories
    const categories = await prisma.governanceProposal.findMany({
      select: {
        category: true
      },
      where: {
        category: {
          not: null
        }
      },
      distinct: ['category']
    });
    
    // Extract category names and filter out null values
    return categories
      .map(c => c.category)
      .filter(Boolean) as string[];
  } catch (error) {
    logger.error('Error getting categories', error);
    throw new AppError('Failed to get governance proposal categories', 500);
  }
};

export default {
  createProposal,
  getProposals,
  getProposalById,
  voteOnProposal,
  getVotingPower,
  getVotingPowerBreakdown,
  getUserVotingHistory,
  getCategories
}; 