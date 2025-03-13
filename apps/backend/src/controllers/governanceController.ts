import { Request, Response, NextFunction } from 'express';
import governanceService from '../services/governanceService';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

/**
 * Create a new governance proposal
 */
export const createProposal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, options, endDate, category, tags } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User ID is required', 400));
    }

    const proposal = await governanceService.createProposal({
      title,
      description,
      options,
      endDate: new Date(endDate),
      userId,
      category,
      tags
    });

    res.status(201).json({
      success: true,
      data: proposal
    });
  } catch (error) {
    logger.error('Error in createProposal controller', { error });
    next(error);
  }
};

/**
 * Get all governance proposals with pagination
 */
export const getProposals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const status = req.query.status as 'active' | 'completed' | 'all' || 'all';
    const category = req.query.category as string | undefined;

    const userId = req.user?.id;

    const result = await governanceService.getProposals(userId, category, page, limit, status);

    res.status(200).json(result);
  } catch (error) {
    logger.error('Error in getProposals controller', { error });
    next(error);
  }
};

/**
 * Get a single governance proposal by ID
 */
export const getProposalById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { proposalId } = req.params;

    const userId = req.user?.id;

    const proposal = await governanceService.getProposalById(proposalId, userId);

    res.status(200).json(proposal);
  } catch (error) {
    logger.error('Error in getProposalById controller', { error });
    next(error);
  }
};

/**
 * Vote on a governance proposal
 */
export const voteOnProposal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { proposalId } = req.params;
    const { optionId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User ID is required', 400));
    }

    const vote = await governanceService.vote({
      proposalId,
      optionId,
      userId
    });

    res.status(200).json({
      success: true,
      message: 'Vote cast successfully',
      data: vote
    });
  } catch (error) {
    logger.error('Error in voteOnProposal controller', { error });
    next(error);
  }
};

/**
 * Get user's voting power
 */
export const getVotingPower = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User ID is required', 400));
    }

    const votingPower = await governanceService.getVotingPower(userId);

    res.status(200).json({
      success: true,
      data: {
        votingPower
      }
    });
  } catch (error) {
    logger.error('Error in getVotingPower controller', { error });
    next(error);
  }
};

/**
 * Get voting power breakdown for a user
 */
export const getVotingPowerBreakdown = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User ID is required', 400));
    }

    const breakdown = await governanceService.getVotingPowerBreakdown(userId);

    res.status(200).json({
      success: true,
      data: breakdown
    });
  } catch (error) {
    logger.error('Error in getVotingPowerBreakdown controller', { error });
    next(error);
  }
};

/**
 * Get user's voting history
 */
export const getUserVotingHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      return next(new AppError('User ID is required', 400));
    }

    const history = await governanceService.getUserVotingHistory(userId, page, limit);

    res.status(200).json({
      success: true,
      ...history
    });
  } catch (error) {
    logger.error('Error in getUserVotingHistory controller', { error });
    next(error);
  }
};

/**
 * Get all governance proposal categories
 */
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await governanceService.getCategories();

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('Error in getCategories controller', { error });
    next(error);
  }
};

export const governanceController = {
  createProposal,
  getProposals,
  getProposalById,
  voteOnProposal,
  getVotingPower,
  getVotingPowerBreakdown,
  getUserVotingHistory,
  getCategories
};

export default governanceController; 