import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, validate } from '../middleware';
import { investmentController } from '../controllers/investmentController';

const router = Router();

// Create new investment
router.post(
  '/',
  authenticate,
  [
    body('assetId').isString().notEmpty().withMessage('Asset ID is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Investment amount must be greater than 0.01'),
  ],
  validate,
  investmentController.createInvestment
);

// Get investment details
router.get(
  '/:id',
  authenticate,
  [
    param('id').isString().withMessage('Investment ID must be a string'),
  ],
  validate,
  investmentController.getInvestmentById
);

// Get investment earnings history
router.get(
  '/:id/earnings',
  authenticate,
  [
    param('id').isString().withMessage('Investment ID must be a string'),
    query('startDate').optional().isDate().withMessage('Start date format is incorrect'),
    query('endDate').optional().isDate().withMessage('End date format is incorrect'),
  ],
  validate,
  investmentController.getInvestmentEarnings
);

// Withdraw investment earnings
router.post(
  '/:id/withdraw',
  authenticate,
  [
    param('id').isString().withMessage('Investment ID must be a string'),
  ],
  validate,
  investmentController.withdrawEarnings
);

// Redeem investment
router.post(
  '/:id/redeem',
  authenticate,
  [
    param('id').isString().withMessage('Investment ID must be a string'),
  ],
  validate,
  investmentController.redeemInvestment
);

// Get user investments
router.get(
  '/',
  authenticate,
  [
    query('status').optional().isString().withMessage('Status must be a string'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  validate,
  investmentController.getUserInvestments
);

export default router; 