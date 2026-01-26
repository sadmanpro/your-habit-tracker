'use client';

import { Pie, PieChart, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
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
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
  'hsl(var(--chart-8))',
  'hsl(var(--chart-9))',
  'hsl(var(--chart-10))',
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
        id: habit.id,
        name: habit.name,
        completions: completedCount,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      };
    }).filter(item => item.completions > 0);
  }, [habits, daysInWeek]);
  
  const weeklyStats = useMemo(() => {
    if (!habits || habits.length === 0) {
      return {
        percentage: 0,
      };
    }
    const totalPossibleCompletions = habits.length * daysInWeek.length;
    
    const totalCompleted = habits.reduce((total, habit) => {
        const habitCompletions = daysInWeek.reduce((count, day) => {
            const dateKey = formatDateKey(day);
            return count + (habit.completions[dateKey] ? 1 : 0);
        }, 0);
        return total + habitCompletions;
    }, 0);

    return {
      percentage: totalPossibleCompletions > 0 ? Math.round((totalCompleted / totalPossibleCompletions) * 100) : 0,
    };
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

  return (
    <div className="relative h-48 w-72 flex items-center justify-center">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums">
            {weeklyStats.percentage}<span className="text-xl font-normal">%</span>
            </span>
            <span className="text-xs text-muted-foreground">
            Weekly Goal
            </span>
        </div>
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
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            stroke="none"
          >
            {chartData.map((entry) => (
              <Cell key={`cell-${entry.id}`} fill={entry.fill} className="outline-none" />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  );
}
