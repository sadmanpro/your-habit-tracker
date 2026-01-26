'use client';

import { useState, useEffect } from 'react';
import { dailyQuotes } from '@/lib/quotes';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

type DailyQuoteProps = {
  currentDate: Date;
};

export default function DailyQuote({ currentDate }: DailyQuoteProps) {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // Use the day of the month to get a quote.
    const dayIndex = currentDate.getDate() - 1;
    // Use modulo to loop through quotes if we have more days than quotes
    setQuote(dailyQuotes[dayIndex % dailyQuotes.length]);
  }, [currentDate]);

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Quote className="h-5 w-5 shrink-0" />
          <p className="italic text-sm sm:text-base">"{quote}"</p>
        </div>
      </CardContent>
    </Card>
  );
}
