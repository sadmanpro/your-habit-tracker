'use client';

import { useState, useMemo } from 'react';
import type { DailyTask } from '@/lib/tasks-data';
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { formatDateKey, getCalendarWeekDays } from '@/lib/date-utils';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import AddEditTaskDialog from './add-edit-task-dialog';
import WeeklyTaskProgressChart from './weekly-task-progress-chart';
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
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"


export default function WeeklyTasks() {
  const [currentDate] = useState(new Date());
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<DailyTask | null>(null);
  const [dateForNewTask, setDateForNewTask] = useState<string | null>(null);

  const [deleteAlert, setDeleteAlert] = useState<{ isOpen: boolean; taskId: string | null }>({
    isOpen: false,
    taskId: null,
  });

  const { user } = useUser();
  const firestore = useFirestore();

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekEnd = useMemo(() => endOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const daysInWeek = useMemo(() => getCalendarWeekDays(currentDate), [currentDate]);
  
  const tasksQuery = useMemoFirebase(
    () => (user ? query(
        collection(firestore, 'users', user.uid, 'dailyTasks'),
        where('date', '>=', formatDateKey(weekStart)),
        where('date', '<=', formatDateKey(weekEnd))
    ) : null),
    [firestore, user, weekStart, weekEnd]
  );
  const { data: tasks } = useCollection<DailyTask>(tasksQuery);
  
  const tasksByDay = useMemo(() => {
    const groupedTasks: Record<string, DailyTask[]> = {};
    daysInWeek.forEach(day => {
        const dayKey = formatDateKey(day);
        groupedTasks[dayKey] = [];
    });
    (tasks || []).forEach(task => {
        if (groupedTasks[task.date]) {
            groupedTasks[task.date].push(task);
        }
    });
    return groupedTasks;
  }, [tasks, daysInWeek]);

  const handleTaskCompletionChange = (taskId: string, isCompleted: boolean) => {
    if (!user) return;
    const taskRef = doc(firestore, 'users', user.uid, 'dailyTasks', taskId);
    updateDocumentNonBlocking(taskRef, { isCompleted });
  };

  const handleOpenAddDialog = (date: string) => {
    setTaskToEdit(null);
    setDateForNewTask(date);
    setIsAddEditDialogOpen(true);
  };

  const handleOpenEditDialog = (task: DailyTask) => {
    setTaskToEdit(task);
    setDateForNewTask(null);
    setIsAddEditDialogOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (!user) return;
    const taskRef = doc(firestore, 'users', user.uid, 'dailyTasks', taskId);
    deleteDocumentNonBlocking(taskRef);
  };

  const handleConfirmDelete = () => {
    if (deleteAlert.taskId) {
        handleDeleteTask(deleteAlert.taskId);
    }
    setDeleteAlert({ isOpen: false, taskId: null });
  };

  const handleSaveTask = (taskData: { name: string; id?: string }) => {
    if (!user) return;

    if (taskData.id) { // Editing existing task
      const taskRef = doc(firestore, 'users', user.uid, 'dailyTasks', taskData.id);
      updateDocumentNonBlocking(taskRef, { name: taskData.name });
    } else if (dateForNewTask) { // Adding new task
      const dailyTasksCol = collection(firestore, 'users', user.uid, 'dailyTasks');
      const newTask = {
        name: taskData.name,
        userId: user.uid,
        date: dateForNewTask,
        isCompleted: false,
        createdAt: new Date().toISOString(),
      };
      addDocumentNonBlocking(dailyTasksCol, newTask);
    }
  };

  if (!user) {
    return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Please log in to manage your weekly tasks.</p>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <WeeklyTaskProgressChart tasks={tasks || []} currentDate={currentDate} />

      <Card>
        <CardHeader>
          <CardTitle>This Week's Tasks</CardTitle>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full" defaultValue={`item-${formatDateKey(currentDate)}`}>
                {daysInWeek.map(day => {
                    const dayKey = formatDateKey(day);
                    const dayTasks = tasksByDay[dayKey] || [];
                    return (
                        <AccordionItem value={`item-${dayKey}`} key={dayKey}>
                            <AccordionTrigger>
                                <div className="flex justify-between w-full pr-4">
                                    <span>{format(day, 'EEEE')}</span>
                                    <span className="text-muted-foreground">{format(day, 'MMMM d')}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4 pl-4">
                                    {dayTasks.length > 0 ? dayTasks.map(task => (
                                        <div key={task.id} className="flex items-center gap-4 group">
                                            <Checkbox
                                                id={`task-${task.id}`}
                                                checked={task.isCompleted}
                                                onCheckedChange={(checked) => handleTaskCompletionChange(task.id, !!checked)}
                                            />
                                            <label htmlFor={`task-${task.id}`} className="flex-1 font-medium break-all cursor-pointer">{task.name}</label>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEditDialog(task)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteAlert({ isOpen: true, taskId: task.id })}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-muted-foreground text-sm py-4">No tasks for this day.</p>
                                    )}
                                    <Button onClick={() => handleOpenAddDialog(dayKey)} size="sm" variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
                                        <PlusCircle className="h-4 w-4" />
                                        Add Task
                                    </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )
                })}
            </Accordion>
        </CardContent>
      </Card>

      <AddEditTaskDialog
        isOpen={isAddEditDialogOpen}
        onClose={() => setIsAddEditDialogOpen(false)}
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
            <AlertDialogAction onClick={handleConfirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
