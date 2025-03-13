import express from 'express';
import userRoutes from './userRoutes';
import assetRoutes from './assetRoutes';
import investmentRoutes from './investmentRoutes';
import referralRoutes from './referralRoutes';
import transactionRoutes from './transactionRoutes';
import governanceRoutes from './governanceRoutes';
import commentRoutes from './commentRoutes';
import tokenRoutes from './tokenRoutes';

const router = express.Router();

// Module routes
router.use('/users', userRoutes);
router.use('/assets', assetRoutes);
router.use('/investments', investmentRoutes);
router.use('/referrals', referralRoutes);
router.use('/transactions', transactionRoutes);
router.use('/governance', governanceRoutes);
router.use('/comments', commentRoutes);
router.use('/token', tokenRoutes);

export default router; 