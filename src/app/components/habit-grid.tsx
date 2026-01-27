'use client';
import { useState, useMemo } from 'react';
import type { Habit } from '@/lib/habits-data';
import { getWeeksInMonth, formatDateKey } from '@/lib/date-utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Edit, Trash2, PlusCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { format, isToday, isSameDay } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type HabitGridProps = {
  habits: Habit[];
  currentDate: Date;
  onHabitChange: (habitId: string, date: string, checked: boolean) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onAddHabit: () => void;
};

export default function HabitGrid({ habits, currentDate, onHabitChange, onEditHabit, onDeleteHabit, onAddHabit }: HabitGridProps) {
  const [deleteAlert, setDeleteAlert] = useState<{ isOpen: boolean; habitId: string | null }>({
    isOpen: false,
    habitId: null,
  });
  const [isMonthView, setIsMonthView] = useState(false);
  const weeks = useMemo(() => getWeeksInMonth(currentDate), [currentDate]);

  const currentWeek = useMemo(() => {
    return weeks.find(week => week.some(day => isSameDay(day, currentDate)));
  }, [weeks, currentDate]);

  const displayWeeks = isMonthView ? weeks : (currentWeek ? [currentWeek] : []);

  const getDayColumnStyle = (day: Date) => {
    if (!habits || habits.length === 0) {
        return isToday(day) ? 'bg-primary/10' : '';
    }

    const dayKey = formatDateKey(day);
    const completedCount = habits.filter(h => h.completions[dayKey]).length;
    const completionRate = completedCount / habits.length;

    if (completionRate === 1) { // 100% completed
        return 'bg-accent/20'; // green
    }
    if (completionRate >= 0.75) { // 75%
        return 'bg-chart-4/20';
    }
    if (completionRate >= 0.5) { // 50%
        return 'bg-destructive/20';
    }

    return isToday(day) ? 'bg-primary/10' : '';
  };

  const handleDelete = () => {
    if (deleteAlert.habitId) {
      onDeleteHabit(deleteAlert.habitId);
    }
    setDeleteAlert({ isOpen: false, habitId: null });
  };

  return (
    <>
      <Card className="w-full overflow-hidden shadow-lg">
          <div className="overflow-x-auto relative">
              <table className="min-w-full text-xs sm:text-sm border-collapse">
              <thead className="text-muted-foreground sticky top-0 z-20 bg-card">
                  <tr className="border-b">
                      <th className="sticky left-0 bg-card z-30 p-2 sm:p-3 font-semibold text-left text-foreground w-20 sm:w-28 md:w-48 whitespace-nowrap border-r text-xs sm:text-sm">
                          Habit
                      </th>
                      {isMonthView ? (
                          weeks.map((week, weekIndex) => {
                              const startDay = weekIndex * 7 + 1;
                              const endDay = startDay + week.length - 1;
                              return (
                                <th key={weekIndex} colSpan={week.length} className="p-2 text-center border-l font-semibold text-foreground">
                                    Days {startDay}-{endDay}
                                </th>
                              );
                          })
                      ) : (
                        currentWeek && <th colSpan={currentWeek.length} className="p-2 text-center border-l font-semibold text-foreground">
                            Current Week
                        </th>
                      )}
                  </tr>
                  <tr className="border-b">
                      <th className="sticky left-0 bg-card z-30 border-r p-0 h-14 align-middle">
                        <div className="flex items-center justify-center h-full">
                          <Button onClick={onAddHabit} variant="ghost" size="sm" className="flex-1 h-full text-xs sm:text-sm rounded-none">
                            <PlusCircle className="h-3 w-3 sm:mr-2" />
                            <span className="hidden sm:inline">Add Habit</span>
                          </Button>
                          <Separator orientation="vertical" className="h-6" />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button onClick={() => setIsMonthView(v => !v)} variant="ghost" size="icon" className="h-full rounded-none w-12">
                                  {isMonthView ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  <span className="sr-only">{isMonthView ? 'Collapse to week view' : 'Expand to month view'}</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{isMonthView ? 'Collapse to week view' : 'Expand to month view'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </th>
                      {displayWeeks.flatMap(week =>
                          week.map((day) => (
                              <th key={formatDateKey(day)} className={cn("p-1 sm:p-2 font-normal text-center border-l w-9 sm:w-14", getDayColumnStyle(day))}>
                                  <div className={`text-[0.6rem] sm:text-xs ${isToday(day) ? 'text-primary font-bold' : ''}`}>{format(day, 'E')}</div>
                                  <div className={`text-[0.7rem] sm:text-base font-medium ${isToday(day) ? 'text-primary font-extrabold' : ''}`}>{format(day, 'd')}</div>
                              </th>
                          ))
                      )}
                  </tr>
              </thead>
              <tbody>
                  {habits.map((habit) => (
                      <tr key={habit.id} className="group border-b last:border-none bg-card hover:bg-muted/50 transition-colors">
                          <td className="sticky left-0 bg-card z-10 p-2 sm:p-3 font-medium text-foreground w-20 sm:w-28 md:w-48 border-r">
                               <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                      <div className="flex items-center justify-between gap-2 cursor-pointer w-full">
                                          <span className="flex-grow break-words text-xs sm:text-sm text-left">
                                              {habit.name}
                                          </span>
                                      </div>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                      <DropdownMenuItem onClick={() => onEditHabit(habit)}>
                                          <Edit className="mr-2 h-3 w-3" />
                                          <span>Edit</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => setDeleteAlert({ isOpen: true, habitId: habit.id })} className="text-destructive focus:text-destructive">
                                          <Trash2 className="mr-2 h-3 w-3" />
                                          <span>Delete</span>
                                      </DropdownMenuItem>
                                  </DropdownMenuContent>
                              </DropdownMenu>
                          </td>
                          {displayWeeks.flatMap(week =>
                              week.map(day => {
                                  const dayKey = formatDateKey(day);
                                  return (
                                  <td
                                    key={dayKey}
                                    className={cn("p-2 text-center border-l cursor-pointer transition-all duration-150 hover:brightness-95 active:brightness-90", getDayColumnStyle(day))}
                                    onClick={() => onHabitChange(habit.id, dayKey, !habit.completions[dayKey])}
                                  >
                                      <Checkbox
                                          checked={!!habit.completions[dayKey]}
                                          aria-label={`Mark ${habit.name} for ${format(day, 'MMMM do')}`}
                                          className="w-3 h-3 sm:w-4 sm:h-4 mx-auto rounded-sm transition-all duration-300 data-[state=checked]:scale-110 pointer-events-none"
                                      />
                                  </td>
                                  );
                              })
                          )}
                      </tr>
                  ))}
              </tbody>
              </table>
          </div>
      </Card>
      <AlertDialog
        open={deleteAlert.isOpen}
        onOpenChange={(open) => setDeleteAlert({ isOpen: open, habitId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this habit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
