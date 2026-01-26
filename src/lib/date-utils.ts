import {
  eachDayOfInterval,
  endOfMonth,
  startOfMonth,
  format,
  getWeek,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

export const getDaysInMonth = (date: Date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
};

export const getDaysInCurrentWeek = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const getWeeksInMonth = (date: Date) => {
  const days = getDaysInMonth(date);
  const weeks: Record<number, Date[]> = {};

  days.forEach((day) => {
    // Using ISO week numbering; weekStartsOn: 1 (Monday) is default for getWeek
    const weekNumber = getWeek(day); 
    if (!weeks[weekNumber]) {
      weeks[weekNumber] = [];
    }
    weeks[weekNumber].push(day);
  });
  
  // Ensure weeks are sorted by their numeric key
  const sortedWeeks = Object.keys(weeks)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(weekKey => weeks[parseInt(weekKey)]);

  return sortedWeeks;
};

export const formatDateKey = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const getFormattedDate = (date: Date): string => {
  return format(date, "do MMMM, yyyy");
};
