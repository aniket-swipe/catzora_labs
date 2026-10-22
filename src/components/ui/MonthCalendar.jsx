import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button.jsx";
import { WEEKDAYS, addMonths, dateKey, monthGrid, monthLabel, todayKey } from "../../lib/date.js";
import { cx } from "../../lib/cx.js";

/**
 * Month grid used by the social and editorial calendars.
 *
 * `items` is keyed by `YYYY-MM-DD`; the caller renders each entry, so the same
 * grid serves scheduled posts and pipeline articles without knowing either.
 */
export function MonthCalendar({ items = {}, renderItem, onSelectDay, label = "Calendar" }) {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const today = todayKey();
  const days = monthGrid(month);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[14px] font-semibold text-ink">{monthLabel(month)}</p>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" icon={ChevronLeft} aria-label="Previous month" onClick={() => setMonth((m) => addMonths(m, -1))} />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const d = new Date();
              d.setDate(1);
              setMonth(d);
            }}
          >
            Today
          </Button>
          <Button size="icon" variant="ghost" icon={ChevronRight} aria-label="Next month" onClick={() => setMonth((m) => addMonths(m, 1))} />
        </div>
      </div>

      <div className="scrollbar-thin overflow-x-auto">
        <div
          className="grid min-w-[640px] grid-cols-7 gap-px overflow-hidden rounded-md bg-line ring-1 ring-line"
          role="grid"
          aria-label={label}
        >
          {WEEKDAYS.map((day) => (
            <div key={day} className="bg-sunken px-2 py-1.5 text-[11px] font-medium text-muted">
              {day}
            </div>
          ))}

          {days.map((day) => {
            const key = dateKey(day);
            const entries = items[key] || [];
            const outside = day.getMonth() !== month.getMonth();
            return (
              <div
                key={key}
                className={cx("min-h-[92px] bg-surface p-1.5", outside && "bg-canvas")}
                onDoubleClick={onSelectDay ? () => onSelectDay(key) : undefined}
              >
                <p
                  className={cx(
                    "mb-1 text-[11px]",
                    key === today
                      ? "inline-grid h-5 w-5 place-items-center rounded-full bg-accent font-semibold text-white"
                      : "text-muted"
                  )}
                >
                  {day.getDate()}
                </p>
                {entries.map((entry) => renderItem(entry))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
