export type Habit = {
  id: string;
  name: string;
  completions: Record<string, boolean>; // date string 'YYYY-MM-DD' -> boolean
};

export const INITIAL_HABITS: Habit[] = [
  {
    id: '1',
    name: 'Read for 15 minutes',
    completions: {},
  },
  {
    id: '2',
    name: 'Morning meditation',
    completions: {},
  },
  {
    id: '3',
    name: 'Drink 8 glasses of water',
    completions: {},
  },
  {
    id: '4',
    name: '30 minutes of exercise',
    completions: {},
  },
  {
    id: '5',
    name: 'Write in journal',
    completions: {},
  },
];
