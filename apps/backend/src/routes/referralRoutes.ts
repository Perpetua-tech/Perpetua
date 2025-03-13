import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, validate } from '../middleware';
import { referralController } from '../controllers/referralController';

const router = Router();

// Generate referral code
router.post(
  '/generate',
  authenticate,
  validate,
  referralController.generateReferralCode
);

// Apply referral code
router.post(
  '/apply',
  authenticate,
  [
    body('code').isString().notEmpty().withMessage('Referral code is required'),
  ],
  validate,
  referralController.applyReferralCode
);

// Get user referrals
router.get(
  '/list',
  authenticate,
  validate,
  referralController.getUserReferrals
);

// Get reward history
router.get(
  '/rewards',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be an integer greater than or equal to 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be an integer between 1 and 100'),
  ],
  validate,
  referralController.getRewardHistory
);

// Validate referral code
router.get(
  '/validate/:code',
  [
    param('code').isString().notEmpty().withMessage('Referral code is required'),
  ],
  validate,
  referralController.validateReferralCode
);

// Process rewards (admin only)
router.post(
  '/process-rewards',
  authenticate,
  validate,
  referralController.processRewards
);

export default router; 