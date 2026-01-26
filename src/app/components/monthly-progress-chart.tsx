'use client';

import { RadialBar, RadialBarChart } from 'recharts';
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
];

export default function MonthlyProgressChart({ habits, currentDate }: MonthlyProgressChartProps) {
  const weeksInMonth = useMemo(() => getWeeksInMonth(currentDate), [currentDate]);

  const chartData = useMemo(() => {
    if (!habits || habits.length === 0) return null;

    const weekData = weeksInMonth.map((week, index) => {
      const totalPossible = habits.length * week.length;
      if (totalPossible === 0) {
        return { name: `Week ${index + 1}`, percentage: 0, fill: CHART_COLORS[index % CHART_COLORS.length] };
      }
      
      const totalCompleted = habits.reduce((acc, habit) => {
        return acc + week.filter(day => {
          const dateKey = formatDateKey(day);
          return !!habit.completions[dateKey];
        }).length;
      }, 0);

      const percentage = Math.round((totalCompleted / totalPossible) * 100);
      
      return {
        name: `Week ${index + 1}`,
        percentage: percentage,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      };
    });

    const finalData = [{ name: 'Monthly', ...weekData.reduce((acc, week) => ({...acc, [week.name]: week.percentage}), {}) }];
    return { weekData, finalData };

  }, [habits, weeksInMonth]);
  
  const chartConfig = useMemo(() => {
    if (!chartData) return {};
    const config: any = {};
    chartData.weekData.forEach(item => {
        config[item.name] = {
            label: item.name,
            color: item.fill,
        };
    });
    return config;
  }, [chartData]);

  if (!chartData || chartData.weekData.length === 0 || habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 w-72 text-muted-foreground text-xs text-center p-4">
        <span>No habits to track for this month.</span>
      </div>
    );
  }

  return (
    <div className="relative h-48 w-72 flex items-center justify-center">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-auto h-full w-full"
      >
        <RadialBarChart
          data={chartData.finalData}
          innerRadius="20%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
          barSize={10}
        >
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent formatter={(value, name) => [`${value}%`, name as string]} hideLabel />}
          />
          {chartData.weekData.map(week => (
             <RadialBar key={week.name} dataKey={week.name} background={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} fill={week.fill} />
          ))}
          <ChartLegend content={<ChartLegendContent nameKey="name" />} />
        </RadialBarChart>
      </ChartContainer>
    </div>
  );
}
