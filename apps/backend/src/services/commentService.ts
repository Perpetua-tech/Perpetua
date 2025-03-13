import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

/**
 * Get proposal comments list
 */
export const getComments = async (proposalId: string, page = 1, limit = 10) => {
  try {
    // Check if proposal exists
    const proposal = await prisma.governanceProposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new AppError('Proposal not found', 404);
    }

    // Get top-level comments (excluding replies)
    const comments = await prisma.proposalComment.findMany({
      where: {
        proposalId,
        parentId: null // Only get top-level comments
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    // Get total comments count
    const total = await prisma.proposalComment.count({
      where: {
        proposalId,
        parentId: null,
      },
    });

    return {
      comments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Create comment
 */
export const createComment = async (userId: string, proposalId: string, content: string, parentId?: string) => {
  try {
    // Check if proposal exists
    const proposal = await prisma.governanceProposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new AppError('Proposal not found', 404);
    }

    // If parent comment ID is provided, check if parent comment exists
    if (parentId) {
      const parentComment = await prisma.proposalComment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        throw new AppError('Parent comment not found', 404);
      }
    }

    // Create comment
    const comment = await prisma.proposalComment.create({
      data: {
        content,
        userId,
        proposalId,
        parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return comment;
  } catch (error) {
    throw error;
  }
};

/**
 * Like comment
 */
export const likeComment = async (commentId: string) => {
  try {
    // Check if comment exists
    const comment = await prisma.proposalComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Increment likes count
    const updatedComment = await prisma.proposalComment.update({
      where: { id: commentId },
      data: {
        likesCount: {
          increment: 1,
        },
      },
    });

    return updatedComment;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete comment
 */
export const deleteComment = async (commentId: string, userId: string) => {
  try {
    // Check if comment exists
    const comment = await prisma.proposalComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Check if user is the comment owner
    if (comment.userId !== userId) {
      throw new AppError('Not authorized to delete this comment', 403);
    }

    // Delete comment and its replies
    await prisma.$transaction([
      // Update parent references of any replies
      prisma.proposalComment.updateMany({
        where: {
          parentId: commentId,
        },
        data: {
          parentId: null,
        },
      }),
      // Delete the comment
      prisma.proposalComment.delete({
        where: {
          id: commentId,
        },
      }),
    ]);

    return { success: true };
  } catch (error) {
    throw error;
  }
};

export default {
  getComments,
  createComment,
  likeComment,
  deleteComment,
}; 