'use client';
import type { Habit } from '@/lib/habits-data';
import { Card, CardContent } from '@/components/ui/card';
import MonthlyProgressChart from './monthly-progress-chart';
import WeeklyProgressChart from './weekly-progress-chart';
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
    <Card>
      <CardContent className="p-4 sm:p-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="flex items-center gap-4">
          <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Today</p>
            <p className="text-sm sm:text-xl font-bold text-primary">{formattedDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <WeeklyProgressChart habits={habits} currentDate={currentDate} />
            <p className="text-xs sm:text-sm text-muted-foreground">Weekly Progress</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <MonthlyProgressChart habits={habits} currentDate={currentDate} />
            <p className="text-xs sm:text-sm text-muted-foreground">Monthly Progress</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
