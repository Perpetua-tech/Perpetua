import express from 'express';
import { commentController } from '../controllers/commentController';
import { authenticate } from '../middleware/auth';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validator';

const router = express.Router();

/**
 * @swagger
 * /api/comments/proposals/{proposalId}:
 *   get:
 *     summary: 获取提案的评论列表
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: proposalId
 *         required: true
 *         schema:
 *           type: string
 *         description: 提案ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页条数
 *     responses:
 *       200:
 *         description: 成功获取评论列表
 *       404:
 *         description: 提案不存在
 */
router.get(
  '/proposals/:proposalId',
  [
    param('proposalId').isUUID().withMessage('无效的提案ID')
  ],
  validate,
  commentController.getCommentsByProposalId
);

/**
 * @swagger
 * /api/comments/proposals/{proposalId}:
 *   post:
 *     summary: 创建提案评论
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: proposalId
 *         required: true
 *         schema:
 *           type: string
 *         description: 提案ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 评论内容
 *               parentId:
 *                 type: string
 *                 description: 父评论ID（回复某条评论时使用）
 *     responses:
 *       201:
 *         description: 评论创建成功
 *       400:
 *         description: 无效的请求数据
 *       401:
 *         description: 未认证
 *       404:
 *         description: 提案或父评论不存在
 */
router.post(
  '/proposals/:proposalId',
  authenticate,
  [
    param('proposalId').isUUID().withMessage('无效的提案ID'),
    body('content').notEmpty().withMessage('评论内容不能为空'),
    body('parentId').optional().isUUID().withMessage('无效的父评论ID')
  ],
  validate,
  commentController.createComment
);

/**
 * @swagger
 * /api/comments/{commentId}/like:
 *   post:
 *     summary: 点赞评论
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: 评论ID
 *     responses:
 *       200:
 *         description: 点赞成功
 *       404:
 *         description: 评论不存在
 */
router.post(
  '/:commentId/like',
  [
    param('commentId').isUUID().withMessage('无效的评论ID')
  ],
  validate,
  commentController.likeComment
);

/**
 * @swagger
 * /api/comments/{commentId}:
 *   delete:
 *     summary: 删除评论
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: 评论ID
 *     responses:
 *       200:
 *         description: 评论删除成功
 *       401:
 *         description: 未认证
 *       403:
 *         description: 没有权限
 *       404:
 *         description: 评论不存在
 */
router.delete(
  '/:commentId',
  authenticate,
  [
    param('commentId').isUUID().withMessage('无效的评论ID')
  ],
  validate,
  commentController.deleteComment
);

export default router; 