'use client';
import type { Habit } from '@/lib/habits-data';
import { getWeeksInMonth, formatDateKey } from '@/lib/date-utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { format, getDaysInMonth as getDaysCount, isToday } from 'date-fns';

type HabitGridProps = {
  habits: Habit[];
  currentDate: Date;
  onHabitChange: (habitId: string, date: string, checked: boolean) => void;
};

export default function HabitGrid({ habits, currentDate, onHabitChange }: HabitGridProps) {
  const weeks = getWeeksInMonth(currentDate);
  const totalDaysInMonth = getDaysCount(currentDate);

  const headerStickyClass = "sticky top-0 bg-card z-20";
  const firstColStickyClass = "sticky left-0 bg-card z-30";

  return (
    <Card className="w-full overflow-hidden shadow-lg">
        <div className="overflow-x-auto relative">
            <table className="min-w-full border-collapse text-sm">
            <thead className="text-muted-foreground">
                <tr className="border-b">
                    <th className={`${firstColStickyClass} p-3 font-semibold text-left text-foreground w-48`}>
                        Habit
                    </th>
                    {weeks.map((week, index) => (
                        <th key={index} colSpan={week.length} className={`${headerStickyClass} p-2 text-center border-l font-semibold text-foreground`}>
                            Week {index + 1}
                        </th>
                    ))}
                    <th className={`sticky top-0 right-[12rem] p-3 font-semibold text-center text-foreground border-l w-28 bg-card z-20`}>
                        Completed
                    </th>
                    <th className={`sticky top-0 right-[5rem] p-3 font-semibold text-center text-foreground border-l w-28 bg-card z-20`}>
                        Progress
                    </th>
                    <th className={`sticky top-0 right-0 p-3 font-semibold text-center text-foreground border-l w-20 bg-card z-20`}>
                        %
                    </th>
                </tr>
                <tr className="border-b">
                    <th className={`${firstColStickyClass} top-[53px]`}></th>
                    {weeks.flatMap(week =>
                        week.map(day => (
                            <th key={formatDateKey(day)} className={`${headerStickyClass} top-[53px] p-2 font-normal text-center border-l w-14 ${isToday(day) ? 'bg-primary/10' : ''}`}>
                                <div className={`text-xs ${isToday(day) ? 'text-primary font-bold' : ''}`}>{format(day, 'E')}</div>
                                <div className={`text-lg font-medium ${isToday(day) ? 'text-primary font-extrabold' : ''}`}>{format(day, 'd')}</div>
                            </th>
                        ))
                    )}
                    <th className={`sticky top-[53px] right-[12rem] border-l w-28 bg-card z-20`}></th>
                    <th className={`sticky top-[53px] right-[5rem] border-l w-28 bg-card z-20`}></th>
                    <th className={`sticky top-[53px] right-0 border-l w-20 bg-card z-20`}></th>
                </tr>
            </thead>
            <tbody>
                {habits.map((habit) => {
                    const completedCount = Object.keys(habit.completions).reduce((acc, dateKey) => {
                        const date = new Date(dateKey);
                        if (date.getUTCMonth() === currentDate.getUTCMonth() && date.getUTCFullYear() === currentDate.getUTCFullYear() && habit.completions[dateKey]) {
                            return acc + 1;
                        }
                        return acc;
                    }, 0);

                    const completionPercentage = totalDaysInMonth > 0 ? (completedCount / totalDaysInMonth) * 100 : 0;

                    return (
                        <tr key={habit.id} className="border-b last:border-none bg-card hover:bg-muted/50 transition-colors">
                            <td className="sticky left-0 bg-card z-30 p-3 font-medium text-foreground whitespace-nowrap w-48">{habit.name}</td>
                            {weeks.flatMap(week =>
                                week.map(day => {
                                    const dayKey = formatDateKey(day);
                                    return (
                                    <td key={dayKey} className={`p-2 text-center border-l ${isToday(day) ? 'bg-primary/10' : ''}`}>
                                        <Checkbox
                                            checked={!!habit.completions[dayKey]}
                                            onCheckedChange={(checked) => onHabitChange(habit.id, dayKey, !!checked)}
                                            aria-label={`Mark ${habit.name} for ${format(day, 'MMMM do')}`}
                                            className="w-6 h-6 mx-auto rounded-md transition-all duration-300 data-[state=checked]:scale-110"
                                        />
                                    </td>
                                    );
                                })
                            )}
                            <td className="sticky right-[12rem] p-3 text-center border-l w-28 font-medium bg-card z-20">
                                {completedCount}/{totalDaysInMonth}
                            </td>
                            <td className="sticky right-[5rem] p-3 text-center border-l w-28 bg-card z-20">
                                <Progress value={completionPercentage} className="h-3 w-full bg-muted [&>div]:bg-accent" />
                            </td>
                            <td className="sticky right-0 p-3 text-center font-bold text-accent border-l w-20 bg-card z-20">
                                {Math.round(completionPercentage)}%
                            </td>
                        </tr>
                    );
                })}
            </tbody>
            </table>
        </div>
    </Card>
  );
}
