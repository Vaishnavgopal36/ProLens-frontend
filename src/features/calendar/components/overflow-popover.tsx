import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendar";

interface OverflowPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayNum: number;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  is24HourMode: boolean;
}

export function OverflowPopover({
  open,
  onOpenChange,
  dayNum,
  events,
  onSelectEvent,
  is24HourMode,
}: OverflowPopoverProps) {
  const formatTime = (start: string, end: string) => {
    if (start === "00:00" && end === "23:59")
      return is24HourMode ? "00:00 - 23:59" : "All Day";
    return `${start} - ${end}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-sm border border-border-subtle bg-canvas-surface shadow-xl">
        <div className="px-4 py-3 bg-canvas-bg border-b border-border-subtle flex items-center justify-between">
          <DialogTitle className="font-bold text-xs text-foreground">
            Sep {dayNum}, 2026 ({events.length} events)
          </DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <Icon icon={X} size={15} />
          </button>
        </div>

        <div className="p-3 max-h-72 overflow-y-auto space-y-2">
          {events.map((ev) => (
            <div
              key={ev.id}
              onClick={() => {
                onOpenChange(false);
                onSelectEvent(ev);
              }}
              className={cn(
                "border p-2 rounded text-xs cursor-pointer hover:opacity-90 select-none",
                ev.colorBg,
                ev.colorBorder,
              )}
            >
              <div className={cn("font-bold", ev.colorText)}>{ev.title}</div>
              <div className="text-3xs text-muted-foreground">
                {formatTime(ev.startTime, ev.endTime)}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
