import {
  eachDayOfInterval,
  endOfMonth,
  startOfMonth,
  format,
  isSameDay,
  startOfWeek as dfnsStartOfWeek,
  endOfWeek as dfnsEndOfWeek,
} from 'date-fns';

export const getDaysInMonth = (date: Date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
};

export const getWeeksInMonth = (date: Date): Date[][] => {
  const days = getDaysInMonth(date);
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
  }
  return weeks;
};

export const getDaysInCurrentWeek = (date: Date) => {
  const weeks = getWeeksInMonth(date);
  const currentSegment = weeks.find(week => week.some(day => isSameDay(day, date)));
  return currentSegment || [];
};

export const formatDateKey = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const getFormattedDate = (date: Date): string => {
  return format(date, "do MMMM, yyyy");
};

export const getCalendarWeekDays = (date: Date): Date[] => {
    const start = dfnsStartOfWeek(date, { weekStartsOn: 1 }); // Monday
    const end = dfnsEndOfWeek(date, { weekStartsOn: 1 }); // Sunday
    return eachDayOfInterval({ start, end });
}
