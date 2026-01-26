'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Habit } from '@/lib/habits-data';
import DashboardHeader from './dashboard-header';
import TrendAnalysisChart from './trend-analysis-chart';
import HabitGrid from './habit-grid';
import AddEditHabitDialog from './add-edit-habit-dialog';
import AuthDialog from './auth-dialog';
import DailyQuote from './daily-quote';
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

const defaultHabits: Habit[] = [
  {
    id: 'default-drink-water',
    name: 'Drink Water',
    completions: {},
    userId: 'anonymous',
    createdAt: new Date().toISOString(),
  },
];

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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-primary font-headline tracking-tight">YOUR HABIT TRACKER</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Cultivate consistency, one day at a time.</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user ? (
                 <Button variant="outline" size="icon" onClick={handleSignOut}>
                    <LogOut className="h-6 w-6" />
                    <span className="sr-only">Sign Out</span>
                </Button>
              ) : (
                <Button variant="outline" size="icon" onClick={() => setIsAuthDialogOpen(true)}>
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

        <DashboardHeader habits={displayedHabits || []} currentDate={currentDate} />
        
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Monthly Trend</CardTitle>
            </CardHeader>
            <CardContent className="pl-2 pr-6">
              <TrendAnalysisChart habits={displayedHabits || []} currentDate={currentDate} />
            </CardContent>
          </Card>
        </div>
        
        <HabitGrid 
          habits={displayedHabits || []} 
          currentDate={currentDate} 
          onHabitChange={handleHabitChange}
          onEditHabit={handleOpenEditDialog}
          onDeleteHabit={handleDeleteHabit}
          onAddHabit={handleOpenAddDialog} 
        />
        <DailyQuote currentDate={currentDate} />
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
