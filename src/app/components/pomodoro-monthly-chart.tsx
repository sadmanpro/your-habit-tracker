'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartConfig,
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, parseISO, isSameDay } from 'date-fns';

type PomodoroSession = {
  completedAt: string;
  duration: number;
};

export default function PomodoroMonthlyChart() {
  const { user } = useUser();
  const firestore = useFirestore();

  const [monthStart, monthEnd] = useMemo(() => {
    const now = new Date();
    return [startOfMonth(now), endOfMonth(now)];
  }, []);

  const monthlyQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'pomodoroSessions'),
      where('completedAt', '>=', monthStart.toISOString()),
      where('completedAt', '<=', monthEnd.toISOString())
    );
  }, [firestore, user, monthStart, monthEnd]);

  const { data: sessions } = useCollection<PomodoroSession>(monthlyQuery);

  const chartData = useMemo(() => {
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const dataByDay = daysInMonth.map(day => ({
      date: format(day, 'd'), // Just the day number
      fullDate: format(day, 'MMM d'),
      hours: 0,
    }));

    if (sessions) {
      sessions.forEach(session => {
        const completedDate = parseISO(session.completedAt);
        const dayIndex = daysInMonth.findIndex(day => isSameDay(day, completedDate));

        if (dayIndex !== -1) {
          dataByDay[dayIndex].hours += session.duration / 60;
        }
      });
    }

    return dataByDay.map(d => ({ ...d, hours: parseFloat(d.hours.toFixed(2)) }));
  }, [sessions, monthStart, monthEnd]);

  const chartConfig: ChartConfig = {
    hours: {
      label: 'Hours',
      color: 'hsl(var(--chart-2))',
    },
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-popover p-2.5 text-sm text-popover-foreground shadow-sm">
          <p className="font-medium">{payload[0].payload.fullDate}</p>
          <p className="text-muted-foreground">{`Studied: ${payload[0].value} hours`}</p>
        </div>
      );
    }
    return null;
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Study Hours</CardTitle>
      </CardHeader>
      <CardContent className="pl-2 pr-6">
        <ChartContainer config={chartConfig} className="h-48 w-full">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
            <YAxis unit="h" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
            <ChartTooltip cursor={false} content={<CustomTooltip />} />
            <Bar dataKey="hours" fill="var(--color-hours)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
