import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Card,
  CardContent,
  IconButton,
  Collapse,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ReplyIcon from '@mui/icons-material/Reply';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import axios from 'axios';
import useSWR, { mutate } from 'swr';
import { useAuth } from '@/context/AuthContext';

// 评论类型定义
interface User {
  id: string;
  name: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  user: User;
  likesCount: number;
  replies: Reply[];
}

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  user: User;
  likesCount: number;
}

interface CommentResponse {
  data: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CommentSectionProps {
  proposalId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ proposalId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comment, setComment] = useState('');
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // 获取评论数据
  const { data: commentsData, error: commentsError, isLoading } = useSWR<CommentResponse>(
    `/api/comments/proposals/${proposalId}?page=${page}&limit=10`
  );

  // 处理评论提交
  const handleCommentSubmit = async () => {
    if (!comment.trim() || !isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      await axios.post(`/api/comments/proposals/${proposalId}`, {
        content: comment
      });

      // 重置评论内容并刷新评论列表
      setComment('');
      mutate(`/api/comments/proposals/${proposalId}?page=${page}&limit=10`);
    } catch (err: any) {
      setError(err.response?.data?.message || '发送评论失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理回复提交
  const handleReplySubmit = async (commentId: string) => {
    if (!replyContent[commentId]?.trim() || !isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      await axios.post(`/api/comments/proposals/${proposalId}`, {
        content: replyContent[commentId],
        parentId: commentId
      });

      // 重置回复内容并刷新评论列表
      setReplyContent(prev => ({ ...prev, [commentId]: '' }));
      setReplyOpen(prev => ({ ...prev, [commentId]: false }));
      mutate(`/api/comments/proposals/${proposalId}?page=${page}&limit=10`);
    } catch (err: any) {
      setError(err.response?.data?.message || '发送回复失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理点赞
  const handleLike = async (commentId: string) => {
    try {
      await axios.post(`/api/comments/${commentId}/like`);
      mutate(`/api/comments/proposals/${proposalId}?page=${page}&limit=10`);
    } catch (err: any) {
      console.error('点赞失败', err);
    }
  };

  // 处理删除评论
  const handleDeleteComment = async (commentId: string) => {
    if (!isAuthenticated) return;

    try {
      await axios.delete(`/api/comments/${commentId}`);
      mutate(`/api/comments/proposals/${proposalId}?page=${page}&limit=10`);
    } catch (err: any) {
      console.error('删除评论失败', err);
    }
  };

  // 切换回复框显示
  const toggleReply = (commentId: string) => {
    setReplyOpen(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (commentsError) {
    return <Alert severity="error">加载评论失败</Alert>;
  }

  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        评论区 ({commentsData?.total || 0})
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* 评论输入框 */}
      {isAuthenticated ? (
        <Box display="flex" mb={4}>
          <Avatar 
            alt={user?.name} 
            src="/static/images/avatar/2.jpg" 
            sx={{ mr: 2, bgcolor: 'primary.main' }}
          >
            {user?.name?.[0]}
          </Avatar>
          <Box flexGrow={1}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="写下你的评论..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              variant="outlined"
              sx={{ mb: 1 }}
            />
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                disabled={!comment.trim() || loading}
                onClick={handleCommentSubmit}
              >
                {loading ? '发送中...' : '发表评论'}
              </Button>
            </Box>
            {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
          </Box>
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>请登录后参与评论</Alert>
      )}
      
      {/* 评论列表 */}
      {commentsData?.data.length === 0 ? (
        <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
          <Typography color="textSecondary">暂无评论，快来发表第一条评论吧！</Typography>
        </Paper>
      ) : (
        commentsData?.data.map(comment => (
          <Card key={comment.id} sx={{ mb: 3, boxShadow: 1 }}>
            <CardContent>
              <Box display="flex">
                <Avatar 
                  alt={comment.user.name} 
                  src="/static/images/avatar/2.jpg" 
                  sx={{ mr: 2, bgcolor: 'primary.main' }}
                >
                  {comment.user.name[0]}
                </Avatar>
                <Box flexGrow={1}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight="bold">
                      {comment.user.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: zhCN })}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" mt={1} whiteSpace="pre-line">
                    {comment.content}
                  </Typography>
                  
                  <Box display="flex" mt={2}>
                    <Button 
                      startIcon={<ThumbUpIcon />} 
                      size="small" 
                      onClick={() => handleLike(comment.id)}
                    >
                      {comment.likesCount > 0 ? comment.likesCount : '点赞'}
                    </Button>
                    
                    {isAuthenticated && (
                      <Button 
                        startIcon={<ReplyIcon />} 
                        size="small" 
                        onClick={() => toggleReply(comment.id)}
                        sx={{ ml: 1 }}
                      >
                        回复
                      </Button>
                    )}
                    
                    {isAuthenticated && (user?.id === comment.userId || user?.role === 'ADMIN') && (
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteComment(comment.id)}
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  
                  {/* 回复输入框 */}
                  <Collapse in={replyOpen[comment.id]} timeout="auto" unmountOnExit>
                    <Box mt={2}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={`回复 ${comment.user.name}...`}
                        value={replyContent[comment.id] || ''}
                        onChange={(e) => setReplyContent(prev => ({ ...prev, [comment.id]: e.target.value }))}
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                      <Box display="flex" justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => toggleReply(comment.id)}
                        >
                          取消
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={!replyContent[comment.id]?.trim() || loading}
                          onClick={() => handleReplySubmit(comment.id)}
                        >
                          回复
                        </Button>
                      </Box>
                    </Box>
                  </Collapse>
                  
                  {/* 回复列表 */}
                  {comment.replies.length > 0 && (
                    <Box mt={2} ml={2} pl={2} borderLeft={1} borderColor="divider">
                      {comment.replies.map(reply => (
                        <Box key={reply.id} mb={2}>
                          <Box display="flex">
                            <Avatar 
                              alt={reply.user.name} 
                              src="/static/images/avatar/2.jpg" 
                              sx={{ mr: 1, width: 28, height: 28, bgcolor: 'secondary.main' }}
                            >
                              {reply.user.name[0]}
                            </Avatar>
                            <Box flexGrow={1}>
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" fontWeight="bold">
                                  {reply.user.name}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true, locale: zhCN })}
                                </Typography>
                              </Box>
                              
                              <Typography variant="body2" mt={0.5}>
                                {reply.content}
                              </Typography>
                              
                              <Box display="flex" mt={1}>
                                <Button 
                                  startIcon={<ThumbUpIcon />} 
                                  size="small" 
                                  onClick={() => handleLike(reply.id)}
                                >
                                  {reply.likesCount > 0 ? reply.likesCount : '点赞'}
                                </Button>
                                
                                {isAuthenticated && (user?.id === reply.userId || user?.role === 'ADMIN') && (
                                  <IconButton 
                                    size="small" 
                                    color="error" 
                                    onClick={() => handleDeleteComment(reply.id)}
                                    sx={{ ml: 1 }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default CommentSection; 