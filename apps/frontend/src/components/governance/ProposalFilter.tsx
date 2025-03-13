import React, { useState, useEffect } from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  Paper,
  Typography,
  Divider,
  Chip
} from '@mui/material';
import useSWR from 'swr';

interface ProposalFilterProps {
  selectedCategory: string;
  selectedStatus: 'active' | 'completed' | 'all';
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: 'active' | 'completed' | 'all') => void;
}

const ProposalFilter: React.FC<ProposalFilterProps> = ({
  selectedCategory,
  selectedStatus,
  onCategoryChange,
  onStatusChange
}) => {
  // 获取分类列表
  const { data: categoriesData } = useSWR('/api/governance/categories');
  const categories = categoriesData?.data || [];

  // 处理分类变更
  const handleCategoryChange = (event: SelectChangeEvent) => {
    onCategoryChange(event.target.value);
  };

  // 处理状态变更
  const handleStatusChange = (event: SelectChangeEvent) => {
    onStatusChange(event.target.value as 'active' | 'completed' | 'all');
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        筛选提案
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
        <FormControl fullWidth variant="outlined">
          <InputLabel id="category-select-label">分类</InputLabel>
          <Select
            labelId="category-select-label"
            id="category-select"
            value={selectedCategory}
            onChange={handleCategoryChange}
            label="分类"
          >
            <MenuItem value="">所有分类</MenuItem>
            {categories.map((category: string) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl fullWidth variant="outlined">
          <InputLabel id="status-select-label">状态</InputLabel>
          <Select
            labelId="status-select-label"
            id="status-select"
            value={selectedStatus}
            onChange={handleStatusChange}
            label="状态"
          >
            <MenuItem value="all">所有状态</MenuItem>
            <MenuItem value="active">进行中</MenuItem>
            <MenuItem value="completed">已结束</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {(selectedCategory || selectedStatus !== 'all') && (
        <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            当前筛选:
          </Typography>
          
          {selectedCategory && (
            <Chip
              label={`分类: ${selectedCategory}`}
              size="small"
              onDelete={() => onCategoryChange('')}
              color="primary"
              variant="outlined"
            />
          )}
          
          {selectedStatus !== 'all' && (
            <Chip
              label={`状态: ${selectedStatus === 'active' ? '进行中' : '已结束'}`}
              size="small"
              onDelete={() => onStatusChange('all')}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      )}
    </Paper>
  );
};

export default ProposalFilter; 