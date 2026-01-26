'use client';

import { Pie, PieChart, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Habit } from '@/lib/habits-data';
import { getDaysInCurrentWeek, formatDateKey } from '@/lib/date-utils';

type WeeklyProgressChartProps = {
  habits: Habit[];
  currentDate: Date;
};

export default function WeeklyProgressChart({ habits, currentDate }: WeeklyProgressChartProps) {
  const daysInWeek = getDaysInCurrentWeek(currentDate);
  const totalPossibleCompletions = habits.length * daysInWeek.length;

  const totalCompleted = habits.reduce((acc, habit) => {
    return acc + daysInWeek.filter(day => {
        const dateKey = formatDateKey(day);
        return !!habit.completions[dateKey];
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
    <div className="relative h-14 w-14 flex items-center justify-center">
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
            innerRadius={18}
            outerRadius={24}
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
        <span className="text-base font-bold" style={{ color: progressColor }}>{Math.round(completionPercentage)}%</span>
      </div>
    </div>
  );
}
