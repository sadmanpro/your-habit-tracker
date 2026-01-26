'use client';
import type { Habit } from '@/lib/habits-data';
import { Card, CardContent } from '@/components/ui/card';
import MonthlyProgressChart from './monthly-progress-chart';
import WeeklyProgressChart from './weekly-progress-chart';
import { getFormattedDate } from '@/lib/date-utils';
import { useState, useEffect } from 'react';
import { Calendar, Quote } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { dailyQuotes } from '@/lib/quotes';

type DashboardHeaderProps = {
  habits: Habit[];
  currentDate: Date;
};

export default function DashboardHeader({ habits, currentDate }: DashboardHeaderProps) {
  const [formattedDate, setFormattedDate] = useState('');
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setFormattedDate(getFormattedDate(currentDate));
    // Use the day of the month to get a quote.
    const dayIndex = currentDate.getDate() - 1;
    // Use modulo to loop through quotes if we have more days than quotes
    setQuote(dailyQuotes[dayIndex % dailyQuotes.length]);
  }, [currentDate]);

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 self-start md:self-center">
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Today</p>
              <p className="text-sm sm:text-xl font-bold text-primary">{formattedDate}</p>
            </div>
          </div>
          
          <Separator orientation="vertical" className="h-24 hidden md:block" />

          <div className="flex flex-wrap items-start justify-center md:justify-around gap-x-8 gap-y-4 flex-1 w-full">
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Weekly Breakdown</h3>
              <WeeklyProgressChart habits={habits} currentDate={currentDate} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Monthly Breakdown</h3>
              <MonthlyProgressChart habits={habits} currentDate={currentDate} />
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="flex items-center gap-3 text-muted-foreground">
          <Quote className="h-5 w-5 shrink-0" />
          <p className="italic text-sm sm:text-base">"{quote}"</p>
        </div>
      </CardContent>
    </Card>
  );
}
