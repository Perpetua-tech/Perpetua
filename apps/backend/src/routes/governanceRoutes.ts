import express from 'express';
import { governanceController } from '../controllers/governanceController';
import { authenticate } from '../middleware/auth';
import { param, query } from 'express-validator';
import { validate } from '../middleware/validator';
import { validateProposalCreate, validateProposalVote } from '../middleware/validator/governanceValidator';

const router = express.Router();

/**
 * @swagger
 * /api/governance/proposals:
 *   post:
 *     summary: Create a new governance proposal
 *     tags: [Governance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - options
 *               - endDate
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the proposal
 *               description:
 *                 type: string
 *                 description: Detailed description of the proposal
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of voting options
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: End date for the proposal voting period
 *     responses:
 *       201:
 *         description: Proposal created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/proposals',
  authenticate,
  validateProposalCreate,
  validate,
  governanceController.createProposal
);

/**
 * @swagger
 * /api/governance/proposals:
 *   get:
 *     summary: 获取提案列表
 *     tags: [Governance]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 每页条数
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, all]
 *         description: 提案状态
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 提案分类
 *     responses:
 *       200:
 *         description: 成功返回提案列表
 */
router.get('/proposals', [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是大于0的整数'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页条数必须在1-100之间'),
  query('status').optional().isIn(['active', 'completed', 'all']).withMessage('状态必须是active、completed或all'),
  query('category').optional().isString().withMessage('分类必须是字符串'),
  validate
], governanceController.getProposals);

/**
 * @swagger
 * /api/governance/proposals/{proposalId}:
 *   get:
 *     summary: 获取提案详情
 *     tags: [Governance]
 *     parameters:
 *       - in: path
 *         name: proposalId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: 提案ID
 *     responses:
 *       200:
 *         description: 成功返回提案详情
 *       404:
 *         description: 提案不存在
 */
router.get('/proposals/:proposalId', [
  param('proposalId').isUUID().withMessage('提案ID必须是有效的UUID'),
  validate
], governanceController.getProposalById);

/**
 * @swagger
 * /api/governance/proposals/{proposalId}/vote:
 *   post:
 *     summary: 对提案进行投票
 *     tags: [Governance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: proposalId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: 提案ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - optionId
 *             properties:
 *               optionId:
 *                 type: string
 *                 format: uuid
 *                 description: 选项ID
 *     responses:
 *       200:
 *         description: 投票成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 提案或选项不存在
 */
router.post('/proposals/:proposalId/vote', [
  authenticate,
  param('proposalId').isUUID().withMessage('提案ID必须是有效的UUID'),
  body('optionId').isUUID().withMessage('选项ID必须是有效的UUID'),
  validate
], governanceController.vote);

/**
 * @swagger
 * /api/governance/voting-power:
 *   get:
 *     summary: 获取当前用户的投票权重
 *     tags: [Governance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功返回投票权重
 *       401:
 *         description: 未授权
 */
router.get('/voting-power', authenticate, governanceController.getVotingPower);

/**
 * @swagger
 * /api/governance/voting-power/breakdown:
 *   get:
 *     summary: Get detailed breakdown of user's voting power
 *     tags: [Governance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detailed breakdown of voting power
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/voting-power/breakdown',
  authenticate,
  governanceController.getVotingPowerBreakdown
);

/**
 * @swagger
 * /api/governance/voting-history:
 *   get:
 *     summary: Get user's voting history
 *     tags: [Governance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: User's voting history
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/voting-history',
  authenticate,
  governanceController.getUserVotingHistory
);

/**
 * @swagger
 * /api/governance/categories:
 *   get:
 *     summary: 获取所有提案分类
 *     tags: [Governance]
 *     responses:
 *       200:
 *         description: 成功返回分类列表
 */
router.get('/categories', governanceController.getCategories);

export default router; 