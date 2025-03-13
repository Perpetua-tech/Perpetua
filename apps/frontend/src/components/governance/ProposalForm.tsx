import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Autocomplete,
  Chip
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import useSWR from 'swr';

interface ProposalFormProps {
  onSuccess?: () => void;
}

const ProposalForm: React.FC<ProposalFormProps> = ({ onSuccess }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [category, setCategory] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 获取分类列表
  const { data: categoriesData } = useSWR('/api/governance/categories');
  const categories = categoriesData?.data || [];
  
  // 如果用户未登录，重定向到登录页面
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/governance/create');
    }
  }, [isAuthenticated, router]);
  
  // 添加选项
  const handleAddOption = () => {
    setOptions([...options, '']);
  };
  
  // 删除选项
  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return; // 至少保留两个选项
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };
  
  // 更新选项
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  
  // 添加标签
  const handleAddTag = () => {
    if (customTag && !tags.includes(customTag)) {
      setTags([...tags, customTag]);
      setCustomTag('');
    }
  };
  
  // 删除标签
  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };
  
  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证表单
    if (!title.trim()) {
      setError('请输入标题');
      return;
    }
    
    if (!description.trim()) {
      setError('请输入描述');
      return;
    }
    
    if (options.some(option => !option.trim())) {
      setError('所有选项都不能为空');
      return;
    }
    
    if (!endDate) {
      setError('请选择结束日期');
      return;
    }
    
    // 检查结束日期是否在未来
    if (endDate.getTime() <= Date.now()) {
      setError('结束日期必须在未来');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await axios.post('/api/governance/proposals', {
        title,
        description,
        options: options.filter(option => option.trim()), // 过滤空选项
        endDate: endDate.toISOString(),
        category: category || undefined,
        tags: tags.length > 0 ? tags.join(',') : undefined
      });
      
      // 成功后重置表单或重定向
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/governance');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '创建提案失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" component="h1" gutterBottom>
        创建提案
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="描述"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              required
              multiline
              rows={6}
              variant="outlined"
              placeholder="详细描述您的提案..."
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Autocomplete
              value={category}
              onChange={(_, newValue) => setCategory(newValue || '')}
              options={categories}
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="分类"
                  variant="outlined"
                  placeholder="选择或输入分类"
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <DateTimePicker
              label="结束日期"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              disablePast
              sx={{ width: '100%' }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              标签
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <TextField
                label="添加标签"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ mr: 1, flexGrow: 1 }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button
                variant="outlined"
                onClick={handleAddTag}
                disabled={!customTag}
                startIcon={<AddIcon />}
              >
                添加
              </Button>
            </Box>
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              {tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleDeleteTag(tag)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              投票选项
            </Typography>
            {options.map((option, index) => (
              <Box key={index} display="flex" alignItems="center" mb={2}>
                <TextField
                  label={`选项 ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  variant="outlined"
                  fullWidth
                  required
                  sx={{ mr: 1 }}
                />
                <IconButton
                  onClick={() => handleRemoveOption(index)}
                  disabled={options.length <= 2}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddOption}
              sx={{ mt: 1 }}
            >
              添加选项
            </Button>
          </Grid>
          
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Button
                variant="outlined"
                onClick={() => router.push('/governance')}
              >
                取消
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : '创建提案'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ProposalForm; 