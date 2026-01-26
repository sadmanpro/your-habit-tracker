'use client';

import { Pie, PieChart, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { Habit } from '@/lib/habits-data';
import { getDaysInCurrentWeek, formatDateKey } from '@/lib/date-utils';
import { useMemo } from 'react';

type WeeklyProgressChartProps = {
  habits: Habit[];
  currentDate: Date;
};

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function WeeklyProgressChart({ habits, currentDate }: WeeklyProgressChartProps) {
  const daysInWeek = useMemo(() => getDaysInCurrentWeek(currentDate), [currentDate]);

  const chartData = useMemo(() => {
    if (!habits || habits.length === 0) return [];
    
    return habits.map((habit, index) => {
      const completedCount = daysInWeek.filter(day => {
        const dateKey = formatDateKey(day);
        return !!habit.completions[dateKey];
      }).length;
      
      return {
        name: habit.name,
        completions: completedCount,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      };
    }).filter(item => item.completions > 0);
  }, [habits, daysInWeek]);

  const chartConfig = useMemo(() => {
    if (!chartData) return {};
    const config: any = {};
    chartData.forEach(item => {
        config[item.name] = {
            label: item.name,
            color: item.fill,
        };
    });
    return config;
  }, [chartData]);


  if (chartData.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-32 w-48 text-muted-foreground text-xs text-center p-4">
            <span>No progress to show for this week.</span>
        </div>
    );
  }

  return (
    <div className="relative h-32 w-48 flex items-center justify-center">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-auto h-full w-full"
      >
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
          <Pie
            data={chartData}
            dataKey="completions"
            nameKey="name"
            innerRadius={40}
            outerRadius={60}
            paddingAngle={2}
            stroke="none"
          >
            {chartData.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={entry.fill} className="outline-none" />
            ))}
          </Pie>
          <ChartLegend content={<ChartLegendContent nameKey="name" layout="vertical" align="right" verticalAlign="middle" />} />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
