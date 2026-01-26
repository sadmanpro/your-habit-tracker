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

  const getProgressColor = () => {
    if (completionPercentage === 100) return 'hsl(var(--accent))'; // green
    if (completionPercentage >= 75) return 'hsl(var(--chart-4))'; // yellow
    if (completionPercentage >= 50) return 'hsl(var(--destructive))'; // red
    return 'hsl(var(--destructive))'; // Also red for < 50%
  }

  const progressColor = getProgressColor();

  const chartData = [
    { name: 'Completed', value: completionPercentage, fill: progressColor },
    { name: 'Remaining', value: 100 - completionPercentage, fill: 'hsl(var(--muted))' },
  ];

  const chartConfig = {};

  return (
    <div className="relative h-16 w-16 flex items-center justify-center">
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
            innerRadius={20}
            outerRadius={28}
            paddingAngle={2}
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} className="outline-none" />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
       <div className="absolute flex items-center justify-center inset-0">
        <span className="text-lg font-bold" style={{ color: progressColor }}>{Math.round(completionPercentage)}%</span>
      </div>
    </div>
  );
}
