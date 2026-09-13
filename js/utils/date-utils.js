const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

export function parseISODate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function getWeekStart(date, weekStartsOn = 0) {
  const result = new Date(date);
  const currentDay = result.getDay();
  const offset = (currentDay - weekStartsOn + 7) % 7;
  result.setDate(result.getDate() - offset);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function getWeekEnd(date, weekStartsOn = 0) {
  return addDays(getWeekStart(date, weekStartsOn), 6);
}

export function getWeekKey(date, weekStartsOn = 0) {
  return toISODate(getWeekStart(date, weekStartsOn));
}

export function formatDate(value) {
  const date = typeof value === "string" ? parseISODate(value) : value;
  return DATE_FORMATTER.format(date);
}

export function formatWeekRange(start, end) {
  return `${SHORT_DATE_FORMATTER.format(start)} to ${SHORT_DATE_FORMATTER.format(end)}`;
}

export function isDateInWeek(dateValue, weekStart, weekStartsOn = 0) {
  return getWeekKey(parseISODate(dateValue), weekStartsOn) === getWeekKey(weekStart, weekStartsOn);
}

export function compareISODate(a, b) {
  return a.localeCompare(b);
}

export function getTodayISO() {
  return toISODate(new Date());
}
