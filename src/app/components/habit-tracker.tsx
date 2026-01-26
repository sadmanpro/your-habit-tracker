'use client';

import { useState, useEffect } from 'react';
import type { Habit } from '@/lib/habits-data';
import { INITIAL_HABITS } from '@/lib/habits-data';
import DashboardHeader from './dashboard-header';
import TrendAnalysisChart from './trend-analysis-chart';
import HabitGrid from './habit-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const HABIT_STORAGE_KEY = 'verdant-habits-data';

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

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
        <header>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary font-headline tracking-tight">Verdant Habits</h1>
          <p className="text-muted-foreground">Cultivate consistency, one day at a time.</p>
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
        
        <HabitGrid habits={habits} currentDate={currentDate} onHabitChange={handleHabitChange} />
      </div>
    </div>
  );
}
