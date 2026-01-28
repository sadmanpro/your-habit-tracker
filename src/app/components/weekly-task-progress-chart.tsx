'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartConfig,
} from '@/components/ui/chart';
import type { DailyTask } from '@/lib/tasks-data';
import { getCalendarWeekDays, formatDateKey } from '@/lib/date-utils';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type WeeklyTaskProgressChartProps = {
  tasks: DailyTask[];
  currentDate: Date;
};

export default function WeeklyTaskProgressChart({ tasks, currentDate }: WeeklyTaskProgressChartProps) {
  const daysInWeek = useMemo(() => getCalendarWeekDays(currentDate), [currentDate]);
  
  const chartData = useMemo(() => daysInWeek.map(day => {
    const dayKey = formatDateKey(day);
    const tasksForDay = tasks.filter(task => task.date === dayKey);
    const completedOnDay = tasksForDay.filter(task => task.isCompleted).length;
    const totalTasks = tasksForDay.length;
    const completionRate = totalTasks > 0 ? (completedOnDay / totalTasks) * 100 : 0;
    return {
      date: format(day, 'E'),
      completionRate: Math.round(completionRate),
      completed: completedOnDay,
      total: totalTasks,
    };
  }), [daysInWeek, tasks]);

  const chartConfig: ChartConfig = {
    completionRate: {
      label: 'Completion %',
      color: 'hsl(var(--chart-1))',
    },
  };

  const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-popover p-2.5 text-sm text-popover-foreground shadow-sm">
          <div className="font-medium mb-1">{label}</div>
          <div className="text-muted-foreground">
            {data.completed} of {data.total} tasks completed
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Progress</CardTitle>
      </CardHeader>
      <CardContent className="pl-2 pr-6">
        <ChartContainer config={chartConfig} className="h-48 w-full">
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
                <linearGradient id="fillWeeklyProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop
                        offset="5%"
                        stopColor="var(--color-completionRate)"
                        stopOpacity={0.8}
                    />
                    <stop
                        offset="95%"
                        stopColor="var(--color-completionRate)"
                        stopOpacity={0.1}
                    />
                </linearGradient>
            </defs>
            <Area
              dataKey="completionRate"
              type="monotone"
              stroke="var(--color-completionRate)"
              fill="url(#fillWeeklyProgress)"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 8,
              }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
