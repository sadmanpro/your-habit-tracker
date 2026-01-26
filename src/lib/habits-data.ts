export type Habit = {
  id: string;
  name: string;
  completions: Record<string, boolean>; // date string 'YYYY-MM-DD' -> boolean
  userId: string;
  createdAt: string;
};
