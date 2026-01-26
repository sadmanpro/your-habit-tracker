'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
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
    const completionRate = habits.length > 0 ? (completedOnDay / habits.length) * 100 : 0;
    return {
      date: format(day, 'MMM d'),
      completionRate: Math.round(completionRate),
    };
  });

  const chartConfig: ChartConfig = {
    completionRate: {
      label: 'Daily Completion',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <div className="h-64 w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <AreaChart
          data={chartData}
          margin={{
            top: 5,
            right: 10,
            left: -20,
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
          <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="dot" />} />
          <defs>
            <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Area
            dataKey="completionRate"
            type="monotone"
            fill="url(#fillGradient)"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
