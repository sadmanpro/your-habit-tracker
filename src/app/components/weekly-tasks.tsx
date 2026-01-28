'use client';

import { useState, useMemo } from 'react';
import type { WeeklyTask } from '@/lib/tasks-data';
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
import { format, startOfWeek } from 'date-fns';
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

const defaultTasks: WeeklyTask[] = [
  {
    id: 'default-weekly-task-1',
    name: 'Plan the week ahead',
    weekStartDate: startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString(),
    completions: {},
    userId: 'anonymous',
    createdAt: new Date().toISOString(),
  }
];

export default function WeeklyTasks() {
  const [currentDate] = useState(new Date());
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<WeeklyTask | null>(null);
  const [deleteAlert, setDeleteAlert] = useState<{ isOpen: boolean; taskId: string | null }>({
    isOpen: false,
    taskId: null,
  });

  const { user } = useUser();
  const firestore = useFirestore();

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const daysInWeek = useMemo(() => getCalendarWeekDays(currentDate), [currentDate]);
  const weekStartDateKey = useMemo(() => formatDateKey(weekStart), [weekStart]);
  
  const tasksQuery = useMemoFirebase(
    () => (user ? query(
        collection(firestore, 'users', user.uid, 'weeklyTasks'),
        where('weekStartDate', '==', weekStartDateKey)
    ) : null),
    [firestore, user, weekStartDateKey]
  );
  const { data: tasks } = useCollection<WeeklyTask>(tasksQuery);
  const displayedTasks = user ? tasks : defaultTasks;

  const handleTaskChange = (taskId: string, date: string, checked: boolean) => {
    if (!user) return;
    const taskRef = doc(firestore, 'users', user.uid, 'weeklyTasks', taskId);
    updateDocumentNonBlocking(taskRef, { [`completions.${date}`]: checked });
  };

  const handleOpenAddDialog = () => {
    setTaskToEdit(null);
    setIsAddEditDialogOpen(true);
  };

  const handleOpenEditDialog = (task: WeeklyTask) => {
    setTaskToEdit(task);
    setIsAddEditDialogOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (!user) return;
    const taskRef = doc(firestore, 'users', user.uid, 'weeklyTasks', taskId);
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

    if (taskData.id) {
      // Update existing task
      const taskRef = doc(firestore, 'users', user.uid, 'weeklyTasks', taskData.id);
      updateDocumentNonBlocking(taskRef, { name: taskData.name });
    } else {
      // Add new task
      const weeklyTasksCol = collection(firestore, 'users', user.uid, 'weeklyTasks');
      const newTask = {
        name: taskData.name,
        userId: user.uid,
        weekStartDate: weekStartDateKey,
        createdAt: new Date().toISOString(),
        completions: {},
      };
      addDocumentNonBlocking(weeklyTasksCol, newTask);
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
      <WeeklyTaskProgressChart tasks={displayedTasks || []} currentDate={currentDate} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>This Week's Tasks</CardTitle>
          <Button onClick={handleOpenAddDialog} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(displayedTasks || []).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No tasks for this week yet. Add one to get started!</p>
            ) : (
                (displayedTasks || []).map(task => (
              <div key={task.id} className="p-4 border rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1 font-medium break-all">{task.name}</div>
                <div className="flex items-center gap-2 sm:gap-4">
                  {daysInWeek.map(day => (
                    <div key={formatDateKey(day)} className="flex flex-col items-center gap-1">
                      <span className="text-xs text-muted-foreground">{format(day, 'E')}</span>
                      <Checkbox
                        checked={!!task.completions[formatDateKey(day)]}
                        onCheckedChange={(checked) => handleTaskChange(task.id, formatDateKey(day), !!checked)}
                        aria-label={`Mark ${task.name} for ${format(day, 'MMMM do')}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(task)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit task</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteAlert({ isOpen: true, taskId: task.id })}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete task</span>
                    </Button>
                </div>
              </div>
            )))}
          </div>
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
              This action cannot be undone. This will permanently delete this weekly task.
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
