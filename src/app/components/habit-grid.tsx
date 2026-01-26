'use client';
import { useState } from 'react';
import type { Habit } from '@/lib/habits-data';
import { getWeeksInMonth, formatDateKey } from '@/lib/date-utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import { format, isToday } from 'date-fns';
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

type HabitGridProps = {
  habits: Habit[];
  currentDate: Date;
  onHabitChange: (habitId: string, date: string, checked: boolean) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
};

export default function HabitGrid({ habits, currentDate, onHabitChange, onEditHabit, onDeleteHabit }: HabitGridProps) {
  const [deleteAlert, setDeleteAlert] = useState<{ isOpen: boolean; habitId: string | null }>({
    isOpen: false,
    habitId: null,
  });
  const weeks = getWeeksInMonth(currentDate);

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
                      <th className="sticky left-0 bg-card z-30 p-2 sm:p-3 font-semibold text-left text-foreground w-20 sm:w-40 md:w-48 whitespace-nowrap border-r">
                          Habit
                      </th>
                      {weeks.map((week, index) => (
                          <th key={index} colSpan={week.length} className="p-2 text-center border-l font-semibold text-foreground">
                              Week {index + 1}
                          </th>
                      ))}
                  </tr>
                  <tr className="border-b">
                      <th className="sticky left-0 bg-card z-30 border-r"></th>
                      {weeks.flatMap(week =>
                          week.map(day => (
                              <th key={formatDateKey(day)} className={`p-2 font-normal text-center border-l w-10 sm:w-14 ${isToday(day) ? 'bg-primary/10' : ''}`}>
                                  <div className={`text-xs ${isToday(day) ? 'text-primary font-bold' : ''}`}>{format(day, 'E')}</div>
                                  <div className={`text-sm sm:text-base font-medium ${isToday(day) ? 'text-primary font-extrabold' : ''}`}>{format(day, 'd')}</div>
                              </th>
                          ))
                      )}
                  </tr>
              </thead>
              <tbody>
                  {habits.map((habit) => (
                      <tr key={habit.id} className="group border-b last:border-none bg-card hover:bg-muted/50 transition-colors">
                          <td className="sticky left-0 bg-card z-10 p-2 sm:p-3 font-medium text-foreground w-20 sm:w-32 md:w-48 border-r">
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
