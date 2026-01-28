'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Habit } from '@/lib/habits-data';
import DashboardHeader from './dashboard-header';
import TrendAnalysisChart from './trend-analysis-chart';
import HabitGrid from './habit-grid';
import AddEditHabitDialog from './add-edit-habit-dialog';
import AuthDialog from './auth-dialog';
import DailyQuote from './daily-quote';
import PomodoroTimer from './pomodoro-timer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from './theme-toggle';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon } from 'lucide-react';
import {
  useUser,
  useFirestore,
  useAuth,
  useCollection,
  useDoc,
  useMemoFirebase,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
  errorEmitter,
  FirestorePermissionError,
} from '@/firebase';
import { collection, doc, getDoc, setDoc, query, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Footer from './footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PomodoroWeeklyChart from './pomodoro-weekly-chart';
import PomodoroMonthlyChart from './pomodoro-monthly-chart';
import dynamic from 'next/dynamic';
import { formatDateKey } from '@/lib/date-utils';

// Helper to generate varied completion data for the last month
const generateDummyCompletions = (pattern: ('high' | 'medium' | 'low' | 'random') = 'random') => {
  const completions: Record<string, boolean> = {};
  const today = new Date();
  for (let i = 0; i < 31; i++) { // For a full month view
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateKey = formatDateKey(date);
    
    let probability;
    switch (pattern) {
      case 'high': probability = 0.8; break; // ~80%
      case 'medium': probability = 0.5; break; // ~50%
      case 'low': probability = 0.2; break; // ~20%
      case 'random': 
      default:
        // Fluctuating probability to make graph go up and down
        probability = 0.1 + (Math.sin(i / 5) * 0.4 + 0.4); // A sine wave for variety
        break;
    }

    if (Math.random() < probability) {
      completions[dateKey] = true;
    }
  }
  return completions;
};


const defaultHabits: Habit[] = [
    {
        id: 'default-drink-water',
        name: 'Drink 8 glasses of water',
        completions: generateDummyCompletions('high'),
        userId: 'anonymous',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'default-exercise',
        name: '30 minutes of exercise',
        completions: generateDummyCompletions('random'),
        userId: 'anonymous',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'default-read',
        name: 'Read for 15 minutes',
        completions: generateDummyCompletions('medium'),
        userId: 'anonymous',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'default-meditate',
        name: 'Meditate for 5 minutes',
        completions: generateDummyCompletions('low'),
        userId: 'anonymous',
        createdAt: new Date().toISOString(),
    },
];

const WeeklyTasks = dynamic(() => import('@/app/components/weekly-tasks'), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
    </div>
  ),
});

export default function HabitTracker() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();

  useEffect(() => {
    if (user && user.email) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (!docSnap.exists()) {
          const nameFromEmail = user.email.split('@')[0];
          const displayName =
            nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
          const newUserDoc = {
            id: user.uid,
            email: user.email,
            createdAt: new Date().toISOString(),
            displayName: displayName,
          };
          setDoc(userDocRef, newUserDoc).catch((serverError) => {
            const permissionError = new FirestorePermissionError({
              path: userDocRef.path,
              operation: 'create',
              requestResourceData: newUserDoc,
            });
            errorEmitter.emit('permission-error', permissionError);
          });
        }
      });
    }
  }, [user, firestore]);

  const habitsQuery = useMemoFirebase(
    () => (user ? query(collection(firestore, 'users', user.uid, 'habits'), orderBy('createdAt', 'desc')) : null),
    [firestore, user]
  );
  const { data: habits, isLoading: habitsLoading } = useCollection<Habit>(habitsQuery);

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<{ displayName: string }>(userDocRef);

  const loading = isUserLoading || (user && (habitsLoading || isProfileLoading));
  const displayedHabits = user ? habits : defaultHabits;

  const handleHabitChange = (habitId: string, date: string, checked: boolean) => {
    if (!user) {
      setIsAuthDialogOpen(true);
      return;
    }
    const habitRef = doc(firestore, 'users', user.uid, 'habits', habitId);
    // Firestore's dot notation is used to update a field within a map.
    updateDocumentNonBlocking(habitRef, { [`completions.${date}`]: checked });
  };
  
  const handleOpenAddDialog = () => {
    if (!user) {
      setIsAuthDialogOpen(true);
      return;
    }
    setHabitToEdit(null);
    setIsAddEditDialogOpen(true);
  };

  const handleOpenEditDialog = (habit: Habit) => {
    if (!user) {
      setIsAuthDialogOpen(true);
      return;
    }
    setHabitToEdit(habit);
    setIsAddEditDialogOpen(true);
  };

  const handleDeleteHabit = (habitId: string) => {
    if (!user) {
      setIsAuthDialogOpen(true);
      return;
    }
    const habitRef = doc(firestore, 'users', user.uid, 'habits', habitId);
    deleteDocumentNonBlocking(habitRef);
  };

  const handleSaveHabit = (habitData: Omit<Habit, 'id' | 'completions' | 'userId' | 'createdAt'> & { id?: string }) => {
    if (!user) {
      setIsAuthDialogOpen(true);
      return;
    }
    const habitsCol = collection(firestore, 'users', user.uid, 'habits');

    if (habitData.id) {
      // Update existing habit
      const habitRef = doc(firestore, 'users', user.uid, 'habits', habitData.id);
      updateDocumentNonBlocking(habitRef, { name: habitData.name });
    } else {
      // Add new habit
      const newHabit = {
        name: habitData.name,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        completions: {},
      };
      addDocumentNonBlocking(habitsCol, newHabit);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };


  if (loading) {
    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
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
    <div className="min-h-screen text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header
          className="animate-in fade-in slide-in-from-top-2 duration-500"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-primary font-headline tracking-tight">YOUR HABIT TRACKER</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Cultivate consistency, one day at a time.</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user ? (
                 <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full hover:bg-blue-500/5 hover:text-foreground">
                    <LogOut className="h-6 w-6" />
                    <span className="sr-only">Sign Out</span>
                </Button>
              ) : (
                <Button variant="ghost" size="icon" onClick={() => setIsAuthDialogOpen(true)} className="rounded-full hover:bg-blue-500/5 hover:text-foreground">
                    <UserIcon className="h-6 w-6" />
                    <span className="sr-only">Open profile</span>
                </Button>
              )}
            </div>
          </div>
          {user && userProfile && (
            <div className="mt-4">
              <p className="text-xl font-semibold text-foreground">
                Hello, {userProfile.displayName}!
              </p>
            </div>
          )}
        </header>

        <Tabs defaultValue="tracker" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tracker">Habit Tracker</TabsTrigger>
                <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
                <TabsTrigger value="weekly-tasks">Weekly Tasks</TabsTrigger>
            </TabsList>
            <TabsContent value="tracker" className="mt-6 space-y-6">
                <div
                className="animate-in fade-in slide-in-from-top-4 duration-500"
                >
                <DashboardHeader habits={displayedHabits || []} currentDate={currentDate} />
                </div>
                
                <div
                className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-top-4 duration-500"
                >
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl sm:text-2xl">Monthly Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2 pr-6">
                    <TrendAnalysisChart habits={displayedHabits || []} currentDate={currentDate} />
                    </CardContent>
                </Card>
                </div>
                
                <div
                className="animate-in fade-in slide-in-from-top-4 duration-500"
                >
                <HabitGrid 
                    habits={displayedHabits || []} 
                    currentDate={currentDate} 
                    onHabitChange={handleHabitChange}
                    onEditHabit={handleOpenEditDialog}
                    onDeleteHabit={handleDeleteHabit}
                    onAddHabit={handleOpenAddDialog} 
                />
                </div>
                
                <div
                className="animate-float"
                >
                <DailyQuote currentDate={currentDate} />
                </div>
            </TabsContent>
            <TabsContent value="pomodoro" className="mt-6 space-y-6">
                <PomodoroTimer />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <PomodoroWeeklyChart />
                    <PomodoroMonthlyChart />
                </div>
            </TabsContent>
            <TabsContent value="weekly-tasks" className="mt-6 space-y-6">
                <WeeklyTasks onAuthRequested={() => setIsAuthDialogOpen(true)} />
            </TabsContent>
        </Tabs>
        
        <div
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <Footer />
        </div>
      </div>
       <AddEditHabitDialog
        isOpen={isAddEditDialogOpen}
        onClose={() => setIsAddEditDialogOpen(false)}
        onSave={handleSaveHabit}
        habitToEdit={habitToEdit}
      />
      {!user && <AuthDialog isOpen={isAuthDialogOpen} onClose={() => setIsAuthDialogOpen(false)} />}
    </div>
  );
}
