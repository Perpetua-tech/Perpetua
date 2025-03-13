import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  IconButton, 
  Alert, 
  CircularProgress,
  InputAdornment,
  Tooltip,
  FormHelperText,
  Paper
} from '@mui/material';
import { useRouter } from 'next/router';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { zhCN } from 'date-fns/locale';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import axios from 'axios';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';

// 表单数据类型
interface FormData {
  title: string;
  description: string;
  options: { text: string }[];
  endDate: Date;
}

// 验证模式
const schema = yup.object().shape({
  title: yup
    .string()
    .required('标题不能为空')
    .min(5, '标题至少需要5个字符')
    .max(100, '标题不能超过100个字符'),
  description: yup
    .string()
    .required('描述不能为空')
    .min(20, '描述至少需要20个字符'),
  options: yup
    .array()
    .of(
      yup.object().shape({
        text: yup.string().required('选项不能为空')
      })
    )
    .min(2, '至少需要2个选项')
    .test('unique-options', '选项不能重复', function(options) {
      if (!options) return true;
      
      const texts = options.map(option => option.text);
      const uniqueTexts = new Set(texts);
      
      return texts.length === uniqueTexts.size;
    }),
  endDate: yup
    .date()
    .required('结束日期不能为空')
    .min(
      new Date(Date.now() + 24 * 60 * 60 * 1000),
      '结束日期必须至少比当前时间晚24小时'
    )
});

const CreateProposal: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取用户投票权重
  const { data: votingPowerData } = useSWR(
    isAuthenticated ? `/api/governance/voting-power` : null
  );

  // 获取投票权重详情
  const { data: votingPowerBreakdown } = useSWR(
    isAuthenticated ? `/api/governance/voting-power/breakdown` : null
  );

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      options: [{ text: '' }, { text: '' }],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 默认一周后
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options'
  });

  // 添加新选项
  const addOption = () => {
    append({ text: '' });
  };

  // 提交表单
  const onSubmit = async (data: FormData) => {
    if (!isAuthenticated) {
      setError('请先登录');
      return;
    }

    // 检查投票权重是否足够
    if (votingPowerData?.data?.votingPower < 100) {
      setError('您的投票权重不足，创建提案需要至少100的投票权重');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...data,
        options: data.options.map(option => option.text),
        endDate: data.endDate.toISOString()
      };

      await axios.post('/api/governance/proposals', payload);
      
      // 创建成功，跳转到提案列表页
      router.push('/governance');
    } catch (err: any) {
      setError(err.response?.data?.message || '创建提案失败，请稍后再试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 返回提案列表
  const handleBack = () => {
    router.push('/governance');
  };

  // 渲染投票权重信息
  const renderVotingPowerInfo = () => {
    if (!isAuthenticated) {
      return (
        <Alert severity="warning" sx={{ mb: 3 }}>
          请先登录后再创建提案
        </Alert>
      );
    }

    if (!votingPowerData) {
      return <CircularProgress size={20} />;
    }

    const votingPower = votingPowerData.data.votingPower;
    const hasEnoughPower = votingPower >= 100;

    return (
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          您的投票权重: {votingPower}
          <Tooltip title="创建提案需要至少100的投票权重">
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>
        
        {!hasEnoughPower && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            您的投票权重不足，创建提案需要至少100的投票权重
          </Alert>
        )}
        
        {votingPowerBreakdown && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              投票权重明细:
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2">
                  投资金额: +{votingPowerBreakdown.data.investmentPower}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2">
                  账户年龄: +{votingPowerBreakdown.data.accountAgePower}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2">
                  活跃度: +{votingPowerBreakdown.data.activityPower}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <Box>
      <Button onClick={handleBack} sx={{ mb: 2 }}>
        返回提案列表
      </Button>
      
      <Typography variant="h4" component="h1" gutterBottom>
        创建治理提案
      </Typography>
      
      {renderVotingPowerInfo()}
      
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="提案标题"
                      variant="outlined"
                      fullWidth
                      error={!!errors.title}
                      helperText={errors.title?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography variant="caption" color="textSecondary">
                              {field.value.length}/100
                            </Typography>
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="提案描述"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={6}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  投票选项
                  <Tooltip title="至少需要2个不同的选项">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Typography>
                
                {fields.map((field, index) => (
                  <Box key={field.id} display="flex" alignItems="center" mb={2}>
                    <Controller
                      name={`options.${index}.text`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={`选项 ${index + 1}`}
                          variant="outlined"
                          fullWidth
                          error={!!errors.options?.[index]?.text}
                          helperText={errors.options?.[index]?.text?.message}
                        />
                      )}
                    />
                    
                    {fields.length > 2 && (
                      <IconButton 
                        onClick={() => remove(index)}
                        sx={{ ml: 1 }}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                
                {errors.options && !errors.options[0]?.text && (
                  <FormHelperText error>
                    {errors.options.message}
                  </FormHelperText>
                )}
                
                <Button
                  startIcon={<AddIcon />}
                  onClick={addOption}
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                >
                  添加选项
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                      <DateTimePicker
                        label="结束日期"
                        value={field.value}
                        onChange={field.onChange}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            variant: 'outlined',
                            error: !!errors.endDate,
                            helperText: errors.endDate?.message
                          }
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isSubmitting || (votingPowerData?.data?.votingPower < 100)}
                >
                  {isSubmitting ? '提交中...' : '创建提案'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateProposal; 