'use client';

import { useState, useMemo } from 'react';
import {
  useUser,
} from '@/firebase';
import { getCalendarWeekDays, formatDateKey } from '@/lib/date-utils';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import WeeklyTaskProgressChart from './weekly-task-progress-chart';

const dummyTasks = [
    { id: '1', name: 'Morning Stand-up' },
    { id: '2', name: 'Design new feature' },
    { id: '3', name: 'Review PRs' },
    { id: '4', name: 'Team meeting' },
];

export default function WeeklyTasks() {
  const [currentDate] = useState(new Date());

  const { user } = useUser();

  const daysInWeek = useMemo(() => getCalendarWeekDays(currentDate), [currentDate]);
  
  if (!user) {
    return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Please log in to manage your weekly tasks.</p>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <WeeklyTaskProgressChart tasks={[]} currentDate={currentDate} />

      <Card>
        <CardHeader>
          <CardTitle>This Week's Tasks</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {daysInWeek.map(day => {
                    const dayKey = formatDateKey(day);
                    return (
                        <div key={dayKey} className="p-4 rounded-lg bg-muted/50 space-y-4 flex flex-col">
                            <div className="font-semibold text-center">
                                <p className="text-sm">{format(day, 'EEE')}</p>
                                <p className="text-3xl font-bold">{format(day, 'd')}</p>
                            </div>
                            <div className="space-y-3 flex-1">
                                {dummyTasks.map(task => (
                                    <div key={`${dayKey}-${task.id}`} className="flex items-center gap-2 p-2 rounded-md bg-card shadow-sm">
                                        <Checkbox id={`task-${dayKey}-${task.id}`} />
                                        <label htmlFor={`task-${dayKey}-${task.id}`} className="text-sm font-medium break-all cursor-pointer flex-1">{task.name}</label>
                                    </div>
                                ))}
                            </div>
                            <Button size="sm" variant="ghost" className="w-full justify-start gap-2 text-muted-foreground mt-auto">
                                <PlusCircle className="h-4 w-4" />
                                Add Task
                            </Button>
                        </div>
                    )
                })}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
