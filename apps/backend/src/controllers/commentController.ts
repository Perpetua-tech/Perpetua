import { Request, Response, NextFunction } from 'express';
import commentService from '../services/commentService';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

/**
 * 获取提案评论列表
 */
export const getCommentsByProposalId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { proposalId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const comments = await commentService.getCommentsByProposalId(proposalId, page, limit);

    res.status(200).json({
      success: true,
      ...comments
    });
  } catch (error) {
    logger.error('获取评论列表失败', { error });
    next(error);
  }
};

/**
 * 创建评论
 */
export const createComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { proposalId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('用户ID是必需的', 400));
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return next(new AppError('评论内容不能为空', 400));
    }

    const comment = await commentService.createComment(userId, proposalId, content, parentId);

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    logger.error('创建评论失败', { error });
    next(error);
  }
};

/**
 * 点赞评论
 */
export const likeComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { commentId } = req.params;

    const comment = await commentService.likeComment(commentId);

    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    logger.error('点赞评论失败', { error });
    next(error);
  }
};

/**
 * 删除评论
 */
export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('用户ID是必需的', 400));
    }

    await commentService.deleteComment(userId, commentId);

    res.status(200).json({
      success: true,
      message: '评论已删除'
    });
  } catch (error) {
    logger.error('删除评论失败', { error });
    next(error);
  }
};

export const commentController = {
  getCommentsByProposalId,
  createComment,
  likeComment,
  deleteComment
};

export default commentController; 