'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sprout, Flower2, Trees, Award } from 'lucide-react';
import type { Habit } from '@/lib/habits-data';
import { formatDateKey } from '@/lib/date-utils';
import { subDays } from 'date-fns';

type RewardSectionProps = {
  habits: Habit[];
  currentDate: Date;
};

const calculateStreak = (habits: Habit[], currentDate: Date): number => {
    if (habits.length === 0) return 0;
    
    let streak = 0;
    let dateToCheck = currentDate;

    const allHabitsCompletedToday = habits.every(h => h.completions[formatDateKey(dateToCheck)]);

    if (!allHabitsCompletedToday) {
        dateToCheck = subDays(currentDate, 1);
    }
    
    while (true) {
      const dayKey = formatDateKey(dateToCheck);
      const allHabitsCompleted = habits.every(h => h.completions[dayKey]);
      
      if (allHabitsCompleted) {
        streak++;
        dateToCheck = subDays(dateToCheck, 1);
      } else {
        break;
      }
    }
    
    return streak;
};

const streakTiers = [
    { milestone: 3, Icon: Sprout, label: '3-Day Sprout', color: 'text-green-500' },
    { milestone: 7, Icon: Flower2, label: '7-Day Bloom', color: 'text-pink-500' },
    { milestone: 30, Icon: Trees, label: '30-Day Forest', color: 'text-teal-600' },
];

export default function RewardSection({ habits, currentDate }: RewardSectionProps) {
  const streak = calculateStreak(habits, currentDate);

  const rewards = streakTiers.map(tier => ({
    ...tier,
    achieved: streak >= tier.milestone,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Streaks & Rewards</CardTitle>
        <Award className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
            <p className="text-6xl font-extrabold text-primary">{streak}</p>
            <p className="text-sm text-muted-foreground">day streak</p>
        </div>
        <div className="flex justify-around items-end">
          {rewards.map(({ Icon, label, achieved, color }) => (
            <div key={label} className="flex flex-col items-center text-center gap-2">
              <Icon
                className={`transition-all duration-500 ${achieved ? color : 'text-muted-foreground/30'}`}
                size={achieved ? 56 : 48}
                strokeWidth={achieved ? 2 : 1.5}
              />
              <p className={`text-xs font-medium ${achieved ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
