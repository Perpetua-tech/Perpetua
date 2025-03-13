import express from 'express';
import { transactionController } from '../controllers/transactionController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * @route GET /api/transactions
 * @desc Get user transaction history
 * @access Private
 */
router.get('/', authenticate, transactionController.getUserTransactions);

/**
 * @route GET /api/transactions/:id
 * @desc Get transaction details
 * @access Private
 */
router.get('/:id', authenticate, transactionController.getTransactionById);

/**
 * @route POST /api/transactions
 * @desc Create new transaction (admin only)
 * @access Admin
 */
router.post('/', authenticate, isAdmin, transactionController.createTransaction);

/**
 * @route PUT /api/transactions/:id/status
 * @desc Update transaction status (admin only)
 * @access Admin
 */
router.put('/:id/status', authenticate, isAdmin, transactionController.updateTransactionStatus);

/**
 * @route GET /api/transactions/stats
 * @desc Get transaction statistics (admin only)
 * @access Admin
 */
router.get('/stats', authenticate, isAdmin, transactionController.getTransactionStats);

export default router; 