'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { DailyTask } from '@/lib/tasks-data';
import { useEffect } from 'react';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Task name must be at least 2 characters.',
  }),
});

type AddEditTaskDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: { name: string; id?: string }) => void;
  taskToEdit: DailyTask | null;
};

export default function AddEditTaskDialog({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
}: AddEditTaskDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        form.reset({ name: taskToEdit.name });
      } else {
        form.reset({ name: '' });
      }
    }
  }, [taskToEdit, isOpen, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave({ id: taskToEdit?.id, ...values });
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{taskToEdit ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          <DialogDescription>
            {taskToEdit
              ? "Make changes to your task here. Click save when you're done."
              : 'Add a new task. Click save when you\'re done.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="col-span-3" />
                    </FormControl>
                    <FormMessage className="col-span-4" />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
