/** Date helpers shared by the calendars in Grow and the schedulers in Hire. */

/** `YYYY-MM-DD` for a Date or ISO string — the key calendars group by. */
export function dateKey(value) {
  const d = value instanceof Date ? value : new Date(value);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

/** Combine a `YYYY-MM-DD` and a `HH:MM` into an ISO timestamp. */
export function combineDateTime(day, time) {
  const [h, m] = String(time || "09:00").split(":").map(Number);
  const d = new Date(`${day}T00:00:00`);
  d.setHours(h || 0, m || 0, 0, 0);
  return d.toISOString();
}

/** The `HH:MM` part of an ISO timestamp, for filling a time input. */
export function timeOf(iso) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * Six weeks of days covering `month`, starting on Monday — the standard
 * month grid, so the calendar is always the same height.
 */
export function monthGrid(month) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - ((first.getDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function monthLabel(month) {
  return month.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function addMonths(month, delta) {
  return new Date(month.getFullYear(), month.getMonth() + delta, 1);
}

export function shortDate(value) {
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function longDate(value) {
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

export function timeLabel(value) {
  return new Date(value).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/** `YYYY-MM-DD` for today, plus an optional day offset. */
export function todayKey(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return dateKey(d);
}

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
