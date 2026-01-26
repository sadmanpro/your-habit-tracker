'use client';
import type { Habit } from '@/lib/habits-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MonthlyProgressChart from './monthly-progress-chart';
import { getFormattedDate } from '@/lib/date-utils';
import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

type DashboardHeaderProps = {
  habits: Habit[];
  currentDate: Date;
};

export default function DashboardHeader({ habits, currentDate }: DashboardHeaderProps) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    setFormattedDate(getFormattedDate(currentDate));
  }, [currentDate]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Today's Date</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-xl sm:text-2xl font-bold text-primary">{formattedDate}</p>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Monthly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyProgressChart habits={habits} currentDate={currentDate} />
        </CardContent>
      </Card>
    </div>
  );
}
