'use client';

import { Pie, PieChart, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Habit } from '@/lib/habits-data';
import { getDaysInMonth, formatDateKey } from '@/lib/date-utils';

type MonthlyProgressChartProps = {
  habits: Habit[];
  currentDate: Date;
};

export default function MonthlyProgressChart({ habits, currentDate }: MonthlyProgressChartProps) {
  const daysInMonth = getDaysInMonth(currentDate);
  const totalPossibleCompletions = habits.length * daysInMonth.length;

  const totalCompleted = habits.reduce((acc, habit) => {
    return acc + daysInMonth.filter(day => {
        const dateKey = formatDateKey(day);
        const date = new Date(dateKey);
        return date.getMonth() === currentDate.getMonth() && 
               date.getFullYear() === currentDate.getFullYear() && 
               habit.completions[dateKey];
    }).length;
  }, 0);
  
  const completionPercentage = totalPossibleCompletions > 0 ? (totalCompleted / totalPossibleCompletions) * 100 : 0;

  const chartData = [
    { name: 'Completed', value: completionPercentage, fill: 'hsl(var(--accent))' },
    { name: 'Remaining', value: 100 - completionPercentage, fill: 'hsl(var(--muted))' },
  ];

  const chartConfig = {};

  return (
    <div className="relative h-24 flex items-center justify-center">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-full"
      >
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel hideIndicator />} />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={30}
            outerRadius={40}
            paddingAngle={5}
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} className="outline-none" />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
       <div className="absolute flex items-center justify-center inset-0">
        <span className="text-2xl font-bold text-accent">{Math.round(completionPercentage)}%</span>
      </div>
    </div>
  );
}
