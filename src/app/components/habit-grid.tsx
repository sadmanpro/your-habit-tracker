'use client';
import type { Habit } from '@/lib/habits-data';
import { getWeeksInMonth, formatDateKey } from '@/lib/date-utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { format, isToday } from 'date-fns';

type HabitGridProps = {
  habits: Habit[];
  currentDate: Date;
  onHabitChange: (habitId: string, date: string, checked: boolean) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
};

export default function HabitGrid({ habits, currentDate, onHabitChange, onEditHabit, onDeleteHabit }: HabitGridProps) {
  const weeks = getWeeksInMonth(currentDate);

  const headerStickyClass = "sticky top-0 bg-card z-20";
  const firstColStickyClass = "sticky left-0 bg-card z-30";

  return (
    <Card className="w-full overflow-hidden shadow-lg">
        <div className="overflow-x-auto relative">
            <table className="min-w-full text-xs sm:text-sm border-collapse">
            <thead className="text-muted-foreground">
                <tr className="border-b">
                    <th className={`${firstColStickyClass} p-2 sm:p-3 font-semibold text-left text-foreground w-20 sm:w-40 md:w-48 whitespace-nowrap`}>
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
                                <div className={`text-sm sm:text-base font-medium ${isToday(day) ? 'text-primary font-extrabold' : ''}`}>{format(day, 'd')}</div>
                            </th>
                        ))
                    )}
                </tr>
            </thead>
            <tbody>
                {habits.map((habit) => {
                    return (
                        <tr key={habit.id} className="group border-b last:border-none bg-card hover:bg-muted/50 transition-colors">
                            <td className="sticky left-0 bg-card z-30 p-2 sm:p-3 font-medium text-foreground w-20 sm:w-32 md:w-48">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="flex-grow break-words text-xs sm:text-sm">{habit.name}</span>
                                    <div className="flex shrink-0 items-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                                        <Button variant="ghost" className="h-5 w-5 p-0.5" onClick={() => onEditHabit(habit)}>
                                            <span className="sr-only">Edit habit</span>
                                            <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" className="h-5 w-5 p-0.5 text-destructive hover:text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => onDeleteHabit(habit.id)}>
                                            <span className="sr-only">Delete habit</span>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </td>
                            {weeks.flatMap(week =>
                                week.map(day => {
                                    const dayKey = formatDateKey(day);
                                    return (
                                    <td key={dayKey} className={`p-2 text-center border-l ${isToday(day) ? 'bg-primary/10' : ''}`}>
                                        <Checkbox
                                            checked={!!habit.completions[dayKey]}
                                            onCheckedChange={(checked) => onHabitChange(habit.id, dayKey, !!checked)}
                                            aria-label={`Mark ${habit.name} for ${format(day, 'MMMM do')}`}
                                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto rounded-sm transition-all duration-300 data-[state=checked]:scale-110"
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
