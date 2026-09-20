import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendar";

interface CalendarEventCardProps {
  event: CalendarEvent;
  onClick?: () => void;
  is24HourMode?: boolean;
}

export function CalendarEventCard({
  event,
  onClick,
  is24HourMode = true,
}: CalendarEventCardProps) {
  // Format start - end times according to mode
  const formatTime = (timeStr?: string) => {
    if (!timeStr || is24HourMode) return timeStr;
    const parts = timeStr.split(":");
    let h = parseInt(parts[0], 10);
    const m = parts[1] || "00";
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  const timeDisplay =
    event.startTime && event.endTime
      ? event.startTime === "00:00" && event.endTime === "23:59"
        ? is24HourMode
          ? "00:00 - 23:59"
          : "All Day"
        : `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`
      : "";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.stopPropagation();
          onClick?.();
        }
      }}
      className={cn(
        "rounded-md border p-1.5 text-left cursor-pointer transition-all hover:opacity-90 hover:shadow-xs select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        event.colorBg,
        event.colorBorder,
      )}
    >
      <p
        className={cn(
          "truncate text-xs font-bold leading-tight",
          event.colorText,
        )}
      >
        {event.title}
      </p>

      {/* Time window or marketing subtext matching the prototype */}
      {event.category === "Marketing" ? (
        <p className="truncate text-3xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
          {event.desc || "AdSense + FB, Target ..."}
        </p>
      ) : (
        timeDisplay && (
          <p className="truncate text-3xs opacity-75 font-normal mt-0.5">
            {timeDisplay}
          </p>
        )
      )}
    </div>
  );
}
