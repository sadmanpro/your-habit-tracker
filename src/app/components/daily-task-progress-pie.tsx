'use client';

import { useMemo } from 'react';
import { Pie, PieChart, Cell } from 'recharts';
import { ChartContainer, ChartConfig } from '@/components/ui/chart';
import type { DailyTask } from '@/lib/tasks-data';

type DailyTaskProgressPieProps = {
  tasks: DailyTask[];
};

const chartConfig: ChartConfig = {
  completed: {
    label: 'Completed',
    color: 'hsl(var(--chart-1))',
  },
  incomplete: {
    label: 'Incomplete',
    color: 'hsl(var(--muted))',
  }
}

export default function DailyTaskProgressPie({ tasks }: DailyTaskProgressPieProps) {
  const stats = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return {
        percentage: 0,
        completed: 0,
        total: 0,
      };
    }
    const completed = tasks.filter(task => task.isCompleted).length;
    const total = tasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { percentage, completed, total };
  }, [tasks]);

  const chartData = useMemo(() => [
    { name: 'completed', value: stats.completed },
    { name: 'incomplete', value: stats.total - stats.completed },
  ], [stats]);

  if (stats.total === 0) {
    return (
        <div className="relative h-20 w-20 mx-auto flex items-center justify-center">
             <span className="text-xs text-muted-foreground">No tasks</span>
        </div>
    );
  }

  return (
    <div className="relative h-20 w-20 mx-auto">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-full w-full"
      >
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={22}
            outerRadius={28}
            startAngle={90}
            endAngle={450}
            stroke="none"
          >
            {chartData.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={`var(--color-${entry.name})`} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold tabular-nums">
          {stats.percentage}<span className="text-xs font-normal">%</span>
        </span>
      </div>
    </div>
  );
}
