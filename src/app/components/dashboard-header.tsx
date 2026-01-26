'use client';
import type { Habit } from '@/lib/habits-data';
import { Card, CardContent } from '@/components/ui/card';
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
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Today</p>
            <p className="text-lg sm:text-2xl font-bold text-primary">{formattedDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-right">
            <p className="text-xs sm:text-sm text-muted-foreground">Monthly Progress</p>
          </div>
          <MonthlyProgressChart habits={habits} currentDate={currentDate} />
        </div>
      </CardContent>
    </Card>
  );
}
