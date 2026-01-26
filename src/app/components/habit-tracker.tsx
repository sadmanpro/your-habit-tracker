'use client';

import { useState, useEffect } from 'react';
import type { Habit } from '@/lib/habits-data';
import { INITIAL_HABITS } from '@/lib/habits-data';
import DashboardHeader from './dashboard-header';
import TrendAnalysisChart from './trend-analysis-chart';
import HabitGrid from './habit-grid';
import AddEditHabitDialog from './add-edit-habit-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const HABIT_STORAGE_KEY = 'verdant-habits-data';

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  useEffect(() => {
    try {
      const storedHabits = localStorage.getItem(HABIT_STORAGE_KEY);
      if (storedHabits) {
        setHabits(JSON.parse(storedHabits));
      } else {
        setHabits(INITIAL_HABITS);
      }
    } catch (error) {
      console.error("Failed to load habits from local storage", error);
      setHabits(INITIAL_HABITS);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(HABIT_STORAGE_KEY, JSON.stringify(habits));
      } catch (error) {
        console.error("Failed to save habits to local storage", error);
      }
    }
  }, [habits, loading]);

  const handleHabitChange = (habitId: string, date: string, checked: boolean) => {
    setHabits(prevHabits =>
      prevHabits.map(habit =>
        habit.id === habitId
          ? {
              ...habit,
              completions: {
                ...habit.completions,
                [date]: checked,
              },
            }
          : habit
      )
    );
  };
  
  const handleOpenAddDialog = () => {
    setHabitToEdit(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (habit: Habit) => {
    setHabitToEdit(habit);
    setIsDialogOpen(true);
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits(prevHabits => prevHabits.filter(habit => habit.id !== habitId));
  };

  const handleSaveHabit = (habitData: Omit<Habit, 'id' | 'completions'> & { id?: string }) => {
    if (habitData.id) {
      // Update existing habit
      setHabits(prevHabits =>
        prevHabits.map(habit =>
          habit.id === habitData.id ? { ...habit, name: habitData.name } : habit
        )
      );
    } else {
      // Add new habit
      const newHabit: Habit = {
        id: new Date().toISOString(), // Simple unique ID
        name: habitData.name,
        completions: {},
      };
      setHabits(prevHabits => [...prevHabits, newHabit]);
    }
  };


  if (loading) {
    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <header>
                    <Skeleton className="h-9 w-64 mb-2" />
                    <Skeleton className="h-5 w-80" />
                </header>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-36" />
                    <Skeleton className="md:col-span-2 h-36" />
                </div>
                 <div className="grid grid-cols-1 gap-6">
                    <Skeleton className="h-80" />
                </div>
                <Skeleton className="h-96" />
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-wrap gap-4 justify-between items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-primary font-headline tracking-tight">YOUR HABIT TRACKER</h1>
            <p className="text-muted-foreground">Cultivate consistency, one day at a time.</p>
          </div>
          <Button onClick={handleOpenAddDialog} size="sm" className="sm:size-auto">
            <PlusCircle className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Habit</span>
          </Button>
        </header>

        <DashboardHeader habits={habits} currentDate={currentDate} />
        
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
                <CardTitle>Monthly Trend</CardTitle>
            </CardHeader>
            <CardContent className="pl-2 pr-6">
              <TrendAnalysisChart habits={habits} currentDate={currentDate} />
            </CardContent>
          </Card>
        </div>
        
        <HabitGrid 
          habits={habits} 
          currentDate={currentDate} 
          onHabitChange={handleHabitChange}
          onEditHabit={handleOpenEditDialog}
          onDeleteHabit={handleDeleteHabit} 
        />
      </div>
       <AddEditHabitDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveHabit}
        habitToEdit={habitToEdit}
      />
    </div>
  );
}
