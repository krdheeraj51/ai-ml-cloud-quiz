import { APP_CONFIG } from "../config/config.js";
import { getTodayISO, getWeekKey, getWeekStart, parseISODate } from "../utils/date-utils.js";

export function getDefaultWeekIndex(weeks) {
  if (!weeks.length) return -1;

  const today = parseISODate(getTodayISO());
  const currentWeekKey = getWeekKey(today, APP_CONFIG.week.weekStartsOn);
  const currentWeekIndex = weeks.findIndex((week) => week.key === currentWeekKey);

  if (currentWeekIndex >= 0) return currentWeekIndex;

  const currentWeekStart = getWeekStart(today, APP_CONFIG.week.weekStartsOn);
  const previousOrCurrent = weeks.filter((week) => week.start <= currentWeekStart);
  if (previousOrCurrent.length) return previousOrCurrent.length - 1;

  return 0;
}

export function canMoveToPreviousWeek(weeks, index) {
  return index > 0 && index <= weeks.length - 1;
}

export function canMoveToNextWeek(weeks, index) {
  return index >= 0 && index < weeks.length - 1;
}

export function getWeekNavigation(weeks, index) {
  return {
    current: weeks[index] ?? null,
    previous: weeks[index - 1] ?? null,
    next: weeks[index + 1] ?? null,
    hasPrevious: canMoveToPreviousWeek(weeks, index),
    hasNext: canMoveToNextWeek(weeks, index)
  };
}

export function getPreferredDateForWeek(week) {
  if (!week?.dates?.length) return null;

  const today = getTodayISO();
  if (week.dates.includes(today)) return today;

  return week.dates[week.dates.length - 1];
}
