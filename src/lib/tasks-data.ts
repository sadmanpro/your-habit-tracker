export type WeeklyTask = {
  id: string;
  name: string;
  weekStartDate: string;
  completions: Record<string, boolean>; // date string 'YYYY-MM-DD' -> boolean
  userId: string;
  createdAt: string;
};
