'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartConfig,
} from '@/components/ui/chart';
import type { Habit } from '@/lib/habits-data';
import { getDaysInMonth, formatDateKey } from '@/lib/date-utils';
import { format } from 'date-fns';

type TrendAnalysisChartProps = {
  habits: Habit[];
  currentDate: Date;
};

export default function TrendAnalysisChart({ habits, currentDate }: TrendAnalysisChartProps) {
  const daysInMonth = getDaysInMonth(currentDate);
  
  const chartData = daysInMonth.map(day => {
    const dayKey = formatDateKey(day);
    const completedOnDay = habits.reduce((acc, habit) => {
      return acc + (habit.completions[dayKey] ? 1 : 0);
    }, 0);
    const totalTasks = habits.length;
    const completionRate = totalTasks > 0 ? (completedOnDay / totalTasks) * 100 : 0;
    return {
      date: format(day, 'MMM d'),
      completionRate: Math.round(completionRate),
      completed: completedOnDay,
      total: totalTasks,
    };
  });

  const totalCompletionRate = chartData.reduce((sum, day) => sum + day.completionRate, 0);
  const averageCompletionRate = chartData.length > 0 ? totalCompletionRate / chartData.length : 0;

  const getProgressColor = () => {
    if (averageCompletionRate === 100) return 'hsl(var(--accent))';
    if (averageCompletionRate >= 75) return 'hsl(var(--chart-4))';
    if (averageCompletionRate >= 50) return 'hsl(var(--destructive))';
    return 'hsl(var(--destructive))';
  }

  const progressColor = getProgressColor();

  const chartConfig: ChartConfig = {
    completionRate: {
      label: 'Daily Completion',
      color: progressColor,
    },
  };

  const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-popover p-2.5 text-sm text-popover-foreground shadow-sm">
          <div className="font-medium mb-1">{label}</div>
          <div className="text-muted-foreground">
            {data.completed} of {data.total} habits completed
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-48 w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <AreaChart
          data={chartData}
          margin={{
            top: 5,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={12}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
            fontSize={12}
          />
          <ChartTooltip
            cursor={true}
            content={<CustomTooltipContent />}
          />
          <defs>
            <linearGradient id="fillTrend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={progressColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={progressColor} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Area
            dataKey="completionRate"
            type="monotone"
            fill="url(#fillTrend)"
            stroke={progressColor}
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
