import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Divider, 
  CircularProgress, 
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Paper,
  LinearProgress,
  Chip,
  Grid,
  Tabs,
  Tab,
  Link as MuiLink,
  Tooltip
} from '@mui/material';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import CommentSection from './CommentSection';
import VoteResultsChart from './VoteResultsChart';
import solanaService from '@/services/solanaService';
import VerifiedIcon from '@mui/icons-material/Verified';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

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
    votingPower: number;
    transactionSignature?: string; // 链上交易签名
  };
  category?: string;
  tags?: string;
}

interface ProposalDetailProps {
  proposalId: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// 标签面板组件
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`proposal-tabpanel-${index}`}
      aria-labelledby={`proposal-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProposalDetail: React.FC<ProposalDetailProps> = ({ proposalId }) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { publicKey, connected, signTransaction } = useWallet();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isVoting, setIsVoting] = useState(false);
  const [onChainVoting, setOnChainVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);

  // 获取提案详情
  const { data: proposal, error: proposalError, isLoading } = useSWR<Proposal>(
    `/api/governance/proposals/${proposalId}`,
    { refreshInterval: 10000 } // 每10秒刷新一次
  );

  // 获取用户投票权重
  const { data: votingPowerData } = useSWR(
    isAuthenticated ? `/api/governance/voting-power` : null
  );

  // 处理标签切换
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 检查提案是否已结束
  const isProposalActive = (endDate: string) => {
    return new Date(endDate) > new Date();
  };

  // 计算总投票数
  const totalVotes = proposal?.options.reduce((sum, option) => sum + option.voteCount, 0) || 0;

  // 处理选项变更
  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
  };

  // 提交投票
  const handleVote = async () => {
    if (!selectedOption || !isAuthenticated) return;
    
    setIsVoting(true);
    setError(null);
    setSuccess(null);
    
    try {
      await axios.post(`/api/governance/proposals/${proposalId}/vote`, {
        optionId: selectedOption
      });
      
      setSuccess('投票成功！');
      // 重新获取提案数据
      mutate(`/api/governance/proposals/${proposalId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || '投票失败，请稍后再试');
    } finally {
      setIsVoting(false);
    }
  };

  // 链上投票
  const handleOnChainVote = async () => {
    if (!selectedOption || !connected || !publicKey || !signTransaction) {
      setError('请先连接钱包');
      return;
    }
    
    setOnChainVoting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // 1. 先在链上投票
      const signature = await solanaService.voteOnChain(
        useWallet(), // 使用完整的钱包上下文，而不是只传递几个属性
        proposalId, 
        selectedOption
      );
      
      if (!signature) {
        throw new Error('链上交易失败');
      }
      
      setTransactionSignature(signature);
      
      // 2. 发送投票到后端，包含交易签名
      await axios.post(`/api/governance/proposals/${proposalId}/vote`, {
        optionId: selectedOption,
        transactionSignature: signature
      });
      
      setSuccess('链上投票成功！交易已确认');
      // 重新获取提案数据
      mutate(`/api/governance/proposals/${proposalId}`);
    } catch (err: any) {
      setError(err.message || '链上投票失败，请稍后再试');
    } finally {
      setOnChainVoting(false);
    }
  };

  // 返回提案列表
  const handleBack = () => {
    router.push('/governance');
  };

  // 渲染标签
  const renderTags = () => {
    if (!proposal?.tags) return null;
    
    const tagArray = proposal.tags.split(',').filter(tag => tag.trim() !== '');
    
    if (tagArray.length === 0) return null;
    
    return (
      <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
        {tagArray.map((tag, index) => (
          <Chip key={index} label={tag.trim()} size="small" color="primary" variant="outlined" />
        ))}
      </Box>
    );
  };

  // 渲染投票选项
  const renderVoteOptions = () => {
    if (!proposal) return null;
    
    const hasVoted = !!proposal.userVote;
    const isActive = isProposalActive(proposal.endDate);
    
    if (hasVoted) {
      return (
        <Box mt={3}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography>您已经投票，投票权重：{proposal.userVote?.votingPower}</Typography>
              {proposal.userVote?.transactionSignature && (
                <Tooltip title="此投票已在区块链上确认">
                  <Box display="flex" alignItems="center" ml={2}>
                    <VerifiedIcon color="success" sx={{ mr: 0.5 }} />
                    <MuiLink 
                      href={`https://explorer.solana.com/tx/${proposal.userVote.transactionSignature}${process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet-beta' ? '' : '?cluster=devnet'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                    >
                      链上验证
                    </MuiLink>
                  </Box>
                </Tooltip>
              )}
            </Box>
          </Alert>
          <Typography variant="h6" gutterBottom>投票结果</Typography>
          {renderVoteResults()}
          <VoteResultsChart 
            options={proposal.options} 
            userVoteOptionId={proposal.userVote?.optionId}
            totalVotes={totalVotes}
          />
        </Box>
      );
    }
    
    if (!isActive) {
      return (
        <Box mt={3}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            该提案已结束投票
          </Alert>
          <Typography variant="h6" gutterBottom>投票结果</Typography>
          {renderVoteResults()}
          <VoteResultsChart 
            options={proposal.options} 
            userVoteOptionId={proposal.userVote?.optionId}
            totalVotes={totalVotes}
          />
        </Box>
      );
    }
    
    if (!isAuthenticated) {
      return (
        <Box mt={3}>
          <Alert severity="info">请登录后参与投票</Alert>
          {totalVotes > 0 && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>当前投票结果</Typography>
              {renderVoteResults()}
              <VoteResultsChart 
                options={proposal.options} 
                totalVotes={totalVotes}
              />
            </>
          )}
        </Box>
      );
    }
    
    return (
      <Box mt={3}>
        <FormControl component="fieldset">
          <FormLabel component="legend">选择一个选项进行投票</FormLabel>
          <RadioGroup value={selectedOption} onChange={handleOptionChange}>
            {proposal.options.map((option) => (
              <FormControlLabel 
                key={option.id} 
                value={option.id} 
                control={<Radio />} 
                label={option.text} 
              />
            ))}
          </RadioGroup>
        </FormControl>
        
        <Box mt={2}>
          {votingPowerData && (
            <Typography variant="body2" gutterBottom>
              您的投票权重：{votingPowerData.data.votingPower}
            </Typography>
          )}
          
          <Box display="flex" gap={2} alignItems="center">
            <Button 
              variant="contained" 
              color="primary" 
              disabled={!selectedOption || isVoting} 
              onClick={handleVote}
            >
              {isVoting ? <CircularProgress size={24} /> : '提交投票'}
            </Button>
            
            <Tooltip title={connected ? '在区块链上确认您的投票' : '请先连接钱包'}>
              <span>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  disabled={!selectedOption || onChainVoting || !connected} 
                  onClick={handleOnChainVote}
                  startIcon={<VerifiedIcon />}
                >
                  {onChainVoting ? <CircularProgress size={24} /> : '链上投票'}
                </Button>
              </span>
            </Tooltip>
            
            <Tooltip title="链上投票将在Solana区块链上记录您的投票，确保投票的透明性和不可变性">
              <InfoOutlinedIcon color="action" />
            </Tooltip>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
            {transactionSignature && (
              <Box mt={1}>
                <MuiLink 
                  href={`https://explorer.solana.com/tx/${transactionSignature}${process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet-beta' ? '' : '?cluster=devnet'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                >
                  查看交易详情
                </MuiLink>
              </Box>
            )}
          </Alert>
        )}
        
        {totalVotes > 0 && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>当前投票结果</Typography>
            {renderVoteResults()}
            <VoteResultsChart 
              options={proposal.options} 
              totalVotes={totalVotes}
            />
          </>
        )}
      </Box>
    );
  };

  // 渲染投票结果
  const renderVoteResults = () => {
    if (!proposal) return null;
    
    return (
      <Box mt={2}>
        {proposal.options.map((option) => {
          const percentage = totalVotes > 0 
            ? Math.round((option.voteCount / totalVotes) * 100) 
            : 0;
          
          const isUserVote = proposal.userVote?.optionId === option.id;
          
          return (
            <Paper 
              key={option.id} 
              elevation={1} 
              sx={{ 
                p: 2, 
                mb: 2,
                border: isUserVote ? '1px solid' : 'none',
                borderColor: 'primary.main'
              }}
            >
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    {option.text}
                    {isUserVote && (
                      <Chip 
                        label="您的选择" 
                        color="primary" 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center">
                    <Box width="100%" mr={1}>
                      <LinearProgress 
                        variant="determinate" 
                        value={percentage} 
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    <Box minWidth={60}>
                      <Typography variant="body2" color="textSecondary">
                        {percentage}% ({option.voteCount})
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          );
        })}
        
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          总投票数：{totalVotes}
        </Typography>
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (proposalError || !proposal) {
    return (
      <Box>
        <Alert severity="error">
          加载提案失败，请稍后再试
        </Alert>
        <Button onClick={handleBack} sx={{ mt: 2 }}>
          返回提案列表
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button onClick={handleBack} sx={{ mb: 2 }}>
        返回提案列表
      </Button>
      
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" component="h1">
              {proposal.title}
            </Typography>
            <Chip 
              label={isProposalActive(proposal.endDate) ? '进行中' : '已结束'} 
              color={isProposalActive(proposal.endDate) ? 'success' : 'default'} 
            />
          </Box>
          
          {proposal.category && (
            <Chip 
              label={proposal.category} 
              color="secondary" 
              size="small"
              sx={{ mt: 1 }}
            />
          )}
          
          {renderTags()}
          
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Typography variant="body2" color="textSecondary">
              创建者: {proposal.creator.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              创建时间: {format(new Date(proposal.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            截止时间: {format(new Date(proposal.endDate), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="提案标签页">
            <Tab label="提案内容" id="proposal-tab-0" aria-controls="proposal-tabpanel-0" />
            <Tab label="投票" id="proposal-tab-1" aria-controls="proposal-tabpanel-1" />
            <Tab label="讨论" id="proposal-tab-2" aria-controls="proposal-tabpanel-2" />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {proposal.description}
            </Typography>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            {renderVoteOptions()}
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <CommentSection proposalId={proposalId} />
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProposalDetail; 