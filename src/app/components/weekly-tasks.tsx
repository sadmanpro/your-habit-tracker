'use client';

import { useState, useMemo } from 'react';
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';
import { doc } from 'firebase/firestore';
import { getCalendarWeekDays, formatDateKey } from '@/lib/date-utils';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { collection, query, where } from 'firebase/firestore';
import type { DailyTask } from '@/lib/tasks-data';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreVertical, Edit, Trash2 } from 'lucide-react';
import WeeklyTaskProgressChart from './weekly-task-progress-chart';
import AddEditTaskDialog from './add-edit-task-dialog';
import DailyTaskProgressPie from './daily-task-progress-pie';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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


export default function WeeklyTasks({ onAuthRequested }: { onAuthRequested: () => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { user } = useUser();
  const firestore = useFirestore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<DailyTask | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [deleteAlert, setDeleteAlert] = useState<{ isOpen: boolean; taskId: string | null }>({
    isOpen: false,
    taskId: null,
  });

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekEnd = useMemo(() => endOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const daysInWeek = useMemo(() => getCalendarWeekDays(currentDate), [currentDate]);

  const tasksQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'dailyTasks'),
      where('date', '>=', formatDateKey(weekStart)),
      where('date', '<=', formatDateKey(weekEnd))
    );
  }, [firestore, user, weekStart, weekEnd]);

  const { data: firestoreTasks } = useCollection<DailyTask>(tasksQuery);
  
  const dummyTasks = useMemo(() => {
    if (user) return null;
    const tasks: DailyTask[] = [];
    const weeklyExampleTasks = [
      // Monday
      ['Plan week\'s goals', 'Kick-off project meeting', 'HIIT workout', 'Meal prep for the week'],
      // Tuesday
      ['Client follow-up calls', 'Deep work on feature X', 'Yoga session', 'Read industry articles'],
      // Wednesday
      ['Team sync-up', 'Code review', 'Mid-week progress check', 'Go for a run'],
      // Thursday
      ['Draft presentation', 'User testing session', 'Strength training', 'Network on LinkedIn'],
      // Friday
      ['Finalize weekly report', 'Celebrate team wins', 'Declutter digital space', 'Plan weekend'],
      // Saturday
      ['Morning hike', 'Work on personal project', 'Grocery shopping', 'Relax & watch a movie'],
      // Sunday
      ['Review finances', 'Tidy up the house', 'Quality time with family', 'Prepare for Monday']
    ];

    daysInWeek.forEach((day, dayIndex) => {
      const dayTasks = weeklyExampleTasks[dayIndex % 7]; // Use modulo to be safe
      const dayKey = formatDateKey(day);
      dayTasks.forEach((taskName, taskIndex) => {
        tasks.push({
          id: `dummy-${dayKey}-${taskIndex}`,
          name: taskName,
          date: dayKey,
          isCompleted: taskIndex % 2 === (dayIndex % 2), // Alternate completion for visual variety
          userId: 'anonymous',
          createdAt: new Date().toISOString(),
        });
      });
    });
    return tasks;
  }, [user, daysInWeek]);

  const tasks = useMemo(() => {
    // Sort firestore tasks by creation date
    const sortedFirestoreTasks = firestoreTasks
      ? [...firestoreTasks].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      : null;
    return user ? sortedFirestoreTasks : dummyTasks;
  }, [user, firestoreTasks, dummyTasks]);
  
  const tasksByDay = useMemo(() => {
    const groupedTasks: { [key: string]: DailyTask[] } = {};
    daysInWeek.forEach(day => {
      groupedTasks[formatDateKey(day)] = [];
    });
    if (tasks) {
      tasks.forEach(task => {
        if (groupedTasks[task.date]) {
          groupedTasks[task.date].push(task);
        }
      });
    }

    return groupedTasks;
  }, [tasks, daysInWeek]);

  const handleOpenAddTaskDialog = (date: string) => {
    if (!user) {
      onAuthRequested();
      return;
    }
    setTaskToEdit(null);
    setSelectedDate(date);
    setIsDialogOpen(true);
  };
  
  const handleOpenEditTaskDialog = (task: DailyTask) => {
    if (!user) {
      onAuthRequested();
      return;
    }
    setTaskToEdit(task);
    setSelectedDate(task.date);
    setIsDialogOpen(true);
  };

  const handleSaveTask = ({ name, id }: { name: string, id?: string }) => {
    if (!user || !selectedDate) return;
    
    if (id) {
      // Update
      const taskRef = doc(firestore, 'users', user.uid, 'dailyTasks', id);
      updateDocumentNonBlocking(taskRef, { name });
    } else {
      // Create
      const tasksCol = collection(firestore, 'users', user.uid, 'dailyTasks');
      addDocumentNonBlocking(tasksCol, {
        name,
        date: selectedDate,
        isCompleted: false,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const handleToggleTask = (task: DailyTask) => {
    if (!user) {
      onAuthRequested();
      return;
    }
    const taskRef = doc(firestore, 'users', user.uid, 'dailyTasks', task.id);
    updateDocumentNonBlocking(taskRef, { isCompleted: !task.isCompleted });
  };
  
  const handleDeleteConfirm = () => {
    if (deleteAlert.taskId && user) {
        const taskRef = doc(firestore, 'users', user.uid, 'dailyTasks', deleteAlert.taskId);
        deleteDocumentNonBlocking(taskRef);
    }
    setDeleteAlert({ isOpen: false, taskId: null });
  };

  const handleOpenDeleteDialog = (taskId: string) => {
    if (!user) {
      onAuthRequested();
      return;
    }
    setDeleteAlert({ isOpen: true, taskId: taskId });
  }

  return (
    <div className="space-y-6">
      <WeeklyTaskProgressChart tasks={tasks || []} currentDate={currentDate} />

      <Card>
        <CardHeader>
          <CardTitle>This Week's Tasks</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-2">
                {daysInWeek.map(day => {
                    const dayKey = formatDateKey(day);
                    const dayTasks = tasksByDay[dayKey] || [];
                    return (
                        <div key={dayKey} className="p-2 rounded-lg bg-muted/50 space-y-2 flex flex-col">
                            <DailyTaskProgressPie tasks={dayTasks} />
                            <div className="font-semibold text-center py-2 space-y-1 rounded-md bg-primary/10">
                                <p className="text-xs text-primary font-bold">{format(day, 'EEE')}</p>
                                <p className="text-xl font-bold text-primary">{format(day, 'd')}</p>
                            </div>
                            <div className="space-y-2 flex-1 overflow-y-auto min-h-[100px]">
                                {dayTasks.map(task => (
                                    <div key={task.id} className="group flex items-center gap-1 p-2 rounded-md bg-card shadow-sm">
                                        <Checkbox 
                                            id={`task-${task.id}`} 
                                            checked={task.isCompleted}
                                            onCheckedChange={() => handleToggleTask(task)}
                                            className="h-3 w-3 sm:h-4 sm:w-4"
                                        />
                                        <label htmlFor={`task-${task.id}`} className={`text-xs sm:text-sm font-medium break-all flex-1 ${user ? 'cursor-pointer' : 'cursor-default'}`}>{task.name}</label>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0" disabled={!user}>
                                                  <MoreVertical className="h-3 w-3" />
                                              </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent>
                                              <DropdownMenuItem onClick={() => handleOpenEditTaskDialog(task)}>
                                                  <Edit className="mr-2 h-3 w-3" />
                                                  <span>Edit</span>
                                              </DropdownMenuItem>
                                              <DropdownMenuItem onClick={() => handleOpenDeleteDialog(task.id)} className="text-destructive focus:text-destructive">
                                                  <Trash2 className="mr-2 h-3 w-3" />
                                                  <span>Delete</span>
                                              </DropdownMenuItem>
                                          </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                ))}
                            </div>
                            <Button size="sm" variant="ghost" className="w-full justify-start gap-2 text-muted-foreground mt-auto" onClick={() => handleOpenAddTaskDialog(dayKey)}>
                                <PlusCircle className="h-4 w-4" />
                                <span className="text-xs">Add Task</span>
                            </Button>
                        </div>
                    )
                })}
            </div>
        </CardContent>
      </Card>
      <AddEditTaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />
      <AlertDialog
        open={deleteAlert.isOpen}
        onOpenChange={(open) => setDeleteAlert({ isOpen: open, taskId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
