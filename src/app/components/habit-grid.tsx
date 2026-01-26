'use client';
import type { Habit } from '@/lib/habits-data';
import { getWeeksInMonth, formatDateKey } from '@/lib/date-utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { format, isToday } from 'date-fns';

type HabitGridProps = {
  habits: Habit[];
  currentDate: Date;
  onHabitChange: (habitId: string, date: string, checked: boolean) => void;
};

export default function HabitGrid({ habits, currentDate, onHabitChange }: HabitGridProps) {
  const weeks = getWeeksInMonth(currentDate);

  const headerStickyClass = "sticky top-0 bg-card z-20";
  const firstColStickyClass = "sticky left-0 bg-card z-30";

  return (
    <Card className="w-full overflow-hidden shadow-lg">
        <div className="overflow-x-auto relative">
            <table className="min-w-full text-sm border-collapse">
            <thead className="text-muted-foreground">
                <tr className="border-b">
                    <th className={`${firstColStickyClass} p-3 font-semibold text-left text-foreground w-28 sm:w-40 md:w-48`}>
                        Habit
                    </th>
                    {weeks.map((week, index) => (
                        <th key={index} colSpan={week.length} className={`${headerStickyClass} p-2 text-center border-l font-semibold text-foreground`}>
                            Week {index + 1}
                        </th>
                    ))}
                </tr>
                <tr className="border-b">
                    <th className={`${firstColStickyClass} top-[53px]`}></th>
                    {weeks.flatMap(week =>
                        week.map(day => (
                            <th key={formatDateKey(day)} className={`${headerStickyClass} top-[53px] p-2 font-normal text-center border-l w-10 sm:w-14 ${isToday(day) ? 'bg-primary/10' : ''}`}>
                                <div className={`text-xs ${isToday(day) ? 'text-primary font-bold' : ''}`}>{format(day, 'E')}</div>
                                <div className={`text-base sm:text-lg font-medium ${isToday(day) ? 'text-primary font-extrabold' : ''}`}>{format(day, 'd')}</div>
                            </th>
                        ))
                    )}
                </tr>
            </thead>
            <tbody>
                {habits.map((habit) => {
                    return (
                        <tr key={habit.id} className="border-b last:border-none bg-card hover:bg-muted/50 transition-colors">
                            <td className="sticky left-0 bg-card z-30 p-3 font-medium text-foreground whitespace-nowrap w-28 sm:w-40 md:w-48">{habit.name}</td>
                            {weeks.flatMap(week =>
                                week.map(day => {
                                    const dayKey = formatDateKey(day);
                                    return (
                                    <td key={dayKey} className={`p-2 text-center border-l ${isToday(day) ? 'bg-primary/10' : ''}`}>
                                        <Checkbox
                                            checked={!!habit.completions[dayKey]}
                                            onCheckedChange={(checked) => onHabitChange(habit.id, dayKey, !!checked)}
                                            aria-label={`Mark ${habit.name} for ${format(day, 'MMMM do')}`}
                                            className="w-4 h-4 sm:w-5 sm:h-5 mx-auto rounded-md transition-all duration-300 data-[state=checked]:scale-110"
                                        />
                                    </td>
                                    );
                                })
                            )}
                        </tr>
                    );
                })}
            </tbody>
            </table>
        </div>
    </Card>
  );
}
