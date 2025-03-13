import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  Grid,
  Pagination,
  CircularProgress,
  Alert,
  Chip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import ProposalFilter from './ProposalFilter';

// 提案类型定义
interface ProposalOption {
  id: string;
  text: string;
  voteCount: number;
}

interface Proposal {
  id: string;
  title: string;
  description: string;
  endDate: string;
  createdAt: string;
  creator: {
    id: string;
    name: string;
  };
  options: ProposalOption[];
  _count: {
    votes: number;
  };
  userVote?: {
    optionId: string;
  };
  category?: string;
  tags?: string;
}

const ProposalList: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'active' | 'completed' | 'all'>('all');
  
  // 构建API查询参数
  const apiUrl = `/api/governance/proposals?page=${page}&limit=6&status=${status}${category ? `&category=${category}` : ''}`;
  
  // 获取提案列表
  const { data, error, isLoading } = useSWR(apiUrl);
  
  // 处理页码变更
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo(0, 0);
  };
  
  // 处理分类变更
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setPage(1);
  };
  
  // 处理状态变更
  const handleStatusChange = (newStatus: 'active' | 'completed' | 'all') => {
    setStatus(newStatus);
    setPage(1);
  };
  
  // 检查提案是否已结束
  const isProposalActive = (endDate: string) => {
    return new Date(endDate) > new Date();
  };
  
  // 前往提案详情页
  const handleViewProposal = (proposalId: string) => {
    router.push(`/governance/proposals/${proposalId}`);
  };
  
  // 前往创建提案页
  const handleCreateProposal = () => {
    if (isAuthenticated) {
      router.push('/governance/create');
    } else {
      router.push('/login?redirect=/governance/create');
    }
  };
  
  // 渲染标签
  const renderTags = (tags?: string) => {
    if (!tags) return null;
    
    const tagArray = tags.split(',').filter(tag => tag.trim() !== '');
    
    if (tagArray.length === 0) return null;
    
    return (
      <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
        {tagArray.map((tag, index) => (
          <Chip
            key={index}
            label={tag.trim()}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ height: 24 }}
          />
        ))}
      </Box>
    );
  };
  
  // 渲染提案列表
  const renderProposals = () => {
    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          加载提案失败，请稍后再试
        </Alert>
      );
    }
    
    if (!data?.data || data.data.length === 0) {
      return (
        <Alert severity="info" sx={{ my: 2 }}>
          暂无提案{category ? `（分类：${category}）` : ''}
        </Alert>
      );
    }
    
    return (
      <Grid container spacing={3}>
        {data.data.map((proposal: Proposal) => {
          const isActive = isProposalActive(proposal.endDate);
          const hasVoted = !!proposal.userVote;
          
          // 截断描述
          const shortDescription = proposal.description.length > 150
            ? `${proposal.description.substring(0, 150)}...`
            : proposal.description;
          
          return (
            <Grid item xs={12} md={6} key={proposal.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  },
                  cursor: 'pointer'
                }}
                onClick={() => handleViewProposal(proposal.id)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" component="h2" gutterBottom noWrap>
                      {proposal.title}
                    </Typography>
                    <Chip 
                      label={isActive ? '进行中' : '已结束'} 
                      color={isActive ? 'success' : 'default'} 
                      size="small"
                    />
                  </Box>
                  
                  {proposal.category && (
                    <Chip 
                      label={proposal.category} 
                      color="secondary" 
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  )}
                  
                  {renderTags(proposal.tags)}
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {shortDescription}
                  </Typography>
                  
                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary">
                      创建者: {proposal.creator.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      创建时间: {format(new Date(proposal.createdAt), 'yyyy年MM月dd日', { locale: zhCN })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      截止时间: {format(new Date(proposal.endDate), 'yyyy年MM月dd日', { locale: zhCN })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      已有 {proposal._count.votes} 人参与投票
                    </Typography>
                  </Box>
                  
                  {hasVoted && (
                    <Chip 
                      label="已投票" 
                      color="primary" 
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          社区治理
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateProposal}
        >
          新建提案
        </Button>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <ProposalFilter
        selectedCategory={category}
        selectedStatus={status}
        onCategoryChange={handleCategoryChange}
        onStatusChange={handleStatusChange}
      />
      
      {renderProposals()}
      
      {data?.meta && data.meta.total > 0 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={data.meta.totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size={isMobile ? 'small' : 'medium'}
          />
        </Box>
      )}
    </Box>
  );
};

export default ProposalList; 