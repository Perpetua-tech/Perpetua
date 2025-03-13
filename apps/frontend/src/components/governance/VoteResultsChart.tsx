import React, { useState } from 'react';
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label
} from 'recharts';

// 定义图表类型
type ChartType = 'pie' | 'bar';

// 定义数据类型
interface VoteOption {
  id: string;
  text: string;
  voteCount: number;
}

interface VoteResultsChartProps {
  options: VoteOption[];
  userVoteOptionId?: string;
  totalVotes: number;
}

const VoteResultsChart: React.FC<VoteResultsChartProps> = ({ 
  options, 
  userVoteOptionId,
  totalVotes 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [chartType, setChartType] = useState<ChartType>('pie');

  // 处理图表类型切换
  const handleChartTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: ChartType | null,
  ) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  // 准备图表数据
  const chartData = options.map((option) => {
    const percentage = totalVotes > 0 
      ? (option.voteCount / totalVotes) * 100 
      : 0;
    
    return {
      id: option.id,
      name: option.text.length > 20 ? `${option.text.substring(0, 20)}...` : option.text,
      fullName: option.text,  // 完整文本(用于tooltip)
      votes: option.voteCount,
      percentage: parseFloat(percentage.toFixed(2)),
      isUserVote: option.id === userVoteOptionId
    };
  });

  // 饼图COLORS
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.info.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    '#8884d8',
    '#83a6ed',
    '#8dd1e1',
    '#82ca9d'
  ];

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ p: 1, boxShadow: 2, maxWidth: 280 }}>
          <Typography fontWeight="bold">{payload[0].payload.fullName}</Typography>
          <Typography variant="body2">
            投票数: {payload[0].payload.votes}
          </Typography>
          <Typography variant="body2">
            百分比: {payload[0].payload.percentage}%
          </Typography>
          {payload[0].payload.isUserVote && (
            <Typography variant="body2" color="primary.main" fontWeight="bold">
              您的选择
            </Typography>
          )}
        </Card>
      );
    }
    return null;
  };

  // 渲染饼图
  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={!isMobile}
          outerRadius={isMobile ? 80 : 110}
          innerRadius={isMobile ? 40 : 60}
          fill={theme.palette.primary.main}
          dataKey="votes"
          nameKey="name"
          label={!isMobile ? ({ name, percentage }) => `${name} (${percentage}%)` : false}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]}
              stroke={entry.isUserVote ? theme.palette.primary.dark : undefined}
              strokeWidth={entry.isUserVote ? 3 : undefined}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  // 渲染条形图
  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={options.length > 3 ? 400 : 300}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: isMobile ? 20 : 60, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={!isMobile} />
        <XAxis type="number" domain={[0, 'dataMax']} />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={isMobile ? 100 : 150}
          tick={{ fontSize: isMobile ? 10 : 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar
          dataKey="votes"
          name="投票数"
          fill={theme.palette.primary.main}
          background={{ fill: '#eee' }}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]}
              stroke={entry.isUserVote ? theme.palette.primary.dark : undefined}
              strokeWidth={entry.isUserVote ? 3 : undefined}
            />
          ))}
          <Label
            content={({ viewBox }) => {
              // @ts-ignore
              const { width, height, x, y } = viewBox;
              return (
                <text x={x + width - 10} y={y + height + 10} fill={theme.palette.text.secondary} textAnchor="end" fontSize={12}>
                  总投票数: {totalVotes}
                </text>
              );
            }}
            position="insideBottomRight"
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <Box mt={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">投票结果分析</Typography>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartTypeChange}
          aria-label="chart type"
          size="small"
        >
          <ToggleButton value="pie" aria-label="pie chart">
            饼图
          </ToggleButton>
          <ToggleButton value="bar" aria-label="bar chart">
            条形图
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Card variant="outlined">
        <CardContent>
          {totalVotes === 0 ? (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              height={200}
            >
              <Typography color="textSecondary">
                暂无投票数据
              </Typography>
            </Box>
          ) : (
            chartType === 'pie' ? renderPieChart() : renderBarChart()
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default VoteResultsChart; 