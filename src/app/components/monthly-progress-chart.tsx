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
import { getWeeksInMonth, formatDateKey } from '@/lib/date-utils';
import { useMemo } from 'react';

type MonthlyProgressChartProps = {
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

export default function MonthlyProgressChart({ habits, currentDate }: MonthlyProgressChartProps) {
  const weeksInMonth = useMemo(() => getWeeksInMonth(currentDate), [currentDate]);

  const chartData = useMemo(() => {
    if (!habits || habits.length === 0) return [];
    
    return weeksInMonth.map((week, index) => {
        const weekCompletions = week.reduce((totalCompletions, day) => {
            const dateKey = formatDateKey(day);
            const dayCompletions = habits.reduce((habitCompletions, habit) => {
                return habitCompletions + (habit.completions[dateKey] ? 1 : 0);
            }, 0);
            return totalCompletions + dayCompletions;
        }, 0);

        return {
            id: `week-${index + 1}`,
            name: `Week ${index + 1}`,
            completions: weekCompletions,
            fill: CHART_COLORS[index % CHART_COLORS.length],
        };
    }).filter(item => item.completions > 0);
  }, [habits, weeksInMonth]);

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
        <div className="flex flex-col items-center justify-center h-48 w-72 text-muted-foreground text-xs text-center p-4">
            <span>No progress to show for this month.</span>
        </div>
    );
  }

  return (
    <div className="relative h-48 w-72 flex items-center justify-center">
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
          <ChartLegend content={<ChartLegendContent nameKey="name" layout="vertical" align="right" verticalAlign="middle" />} />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
