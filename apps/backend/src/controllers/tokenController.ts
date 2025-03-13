import { Router } from 'express';
import { body, param } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import * as tokenService from '../services/tokenService';
import { validate } from '../middleware/validator';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * Get user token balance
 * GET /api/token/balance/:userId
 */
router.get(
  '/balance/:userId',
  authenticate,
  param('userId').isString(),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      
      // Ensure users can only query their own balance
      if (req.user?.id !== userId && req.user?.role !== 'admin') {
        throw new AppError('Unauthorized access', 403);
      }
      
      const balance = await tokenService.getUserBalance(userId);
      res.json({ balance });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get user locked tokens
 * GET /api/token/locked/:userId
 */
router.get(
  '/locked/:userId',
  authenticate,
  param('userId').isString(),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      
      // Ensure users can only query their own locked tokens
      if (req.user?.id !== userId && req.user?.role !== 'admin') {
        throw new AppError('Unauthorized access', 403);
      }
      
      const lockedTokens = await tokenService.getLockedTokens(userId);
      res.json({ lockedTokens });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Lock tokens to increase voting power
 * POST /api/token/lock
 */
router.post(
  '/lock',
  authenticate,
  [
    body('userId').isString(),
    body('amount').isFloat({ min: 0.01 }),
    body('durationDays').isInt({ min: 1 })
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, amount, durationDays } = req.body;
      
      // Ensure users can only lock their own tokens
      if (req.user?.id !== userId && req.user?.role !== 'admin') {
        throw new AppError('Unauthorized access', 403);
      }
      
      const tokenLock = await tokenService.lockTokens(userId, amount, durationDays);
      res.status(201).json({ tokenLock });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Delegate voting power to another user
 * POST /api/token/delegate
 */
router.post(
  '/delegate',
  authenticate,
  [
    body('fromUserId').isString(),
    body('toUserId').isString(),
    body('amount').isFloat({ min: 0.01 }),
    body('durationDays').isInt({ min: 1 }).optional()
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fromUserId, toUserId, amount, durationDays } = req.body;
      
      // Ensure users can only delegate their own voting power
      if (req.user?.id !== fromUserId && req.user?.role !== 'admin') {
        throw new AppError('Unauthorized access', 403);
      }
      
      // Calculate expiry date
      let expiryDate;
      if (durationDays) {
        expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + durationDays);
      }
      
      await tokenService.delegateVotingPower(fromUserId, toUserId, amount, expiryDate);
      
      res.status(201).json({ message: 'Voting power delegated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Revoke delegated voting power
 * POST /api/token/revoke-delegation/:delegationId
 */
router.post(
  '/revoke-delegation/:delegationId',
  authenticate,
  param('delegationId').isString(),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { delegationId } = req.params;
      
      // The delegation ownership will be checked before revocation
      await tokenService.revokeDelegation(delegationId, req.user?.id || '');
      
      res.status(200).json({ message: 'Delegation revoked successfully' });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get user voting power
 * GET /api/token/voting-power/:userId
 */
router.get(
  '/voting-power/:userId',
  authenticate,
  param('userId').isString(),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      
      const votingPower = await tokenService.calculateVotingPower(userId);
      res.json({ votingPower });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Unlock expired tokens
 * POST /api/token/unlock-expired/:userId
 */
router.post(
  '/unlock-expired/:userId',
  authenticate,
  param('userId').isString(),
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      
      // Ensure users can only unlock their own tokens
      if (req.user?.id !== userId && req.user?.role !== 'admin') {
        throw new AppError('Unauthorized access', 403);
      }
      
      const unlockedAmount = await tokenService.unlockExpiredTokens(userId);
      res.json({ 
        message: 'Expired tokens unlocked successfully', 
        unlockedAmount 
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router; 