'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartConfig,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, parseISO, isSameDay } from 'date-fns';

type PomodoroSession = {
  completedAt: string;
  duration: number;
};

export default function PomodoroWeeklyChart() {
  const { user } = useUser();
  const firestore = useFirestore();

  const [weekStart, weekEnd] = useMemo(() => {
    const now = new Date();
    return [startOfWeek(now, { weekStartsOn: 1 }), endOfWeek(now, { weekStartsOn: 1 })];
  }, []);

  const weeklyQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'pomodoroSessions'),
      where('completedAt', '>=', weekStart.toISOString()),
      where('completedAt', '<=', weekEnd.toISOString())
    );
  }, [firestore, user, weekStart, weekEnd]);

  const { data: sessions } = useCollection<PomodoroSession>(weeklyQuery);

  const chartData = useMemo(() => {
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const dataByDay = daysInWeek.map(day => ({
      date: format(day, 'E'),
      hours: 0,
    }));

    if (sessions) {
      sessions.forEach(session => {
        const completedDate = parseISO(session.completedAt);
        const dayIndex = daysInWeek.findIndex(day => isSameDay(day, completedDate));

        if (dayIndex !== -1) {
          dataByDay[dayIndex].hours += session.duration / 60;
        }
      });
    }

    return dataByDay.map(d => ({ ...d, hours: parseFloat(d.hours.toFixed(2)) }));
  }, [sessions, weekStart, weekEnd]);

  const chartConfig: ChartConfig = {
    hours: {
      label: 'Hours',
      color: 'hsl(var(--chart-1))',
    },
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Study Hours</CardTitle>
      </CardHeader>
      <CardContent className="pl-2 pr-6">
        <ChartContainer config={chartConfig} className="h-48 w-full">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
            <YAxis unit="h" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="hours" fill="var(--color-hours)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
