'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const HabitTracker = dynamic(() => import('@/app/components/habit-tracker'), {
  ssr: false,
  loading: () => (
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
  ),
});

export default function Home() {
  return (
    <main>
      <HabitTracker />
    </main>
  );
}
