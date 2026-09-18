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
    if (start === "00:00" && end === "23:59") return is24HourMode ? "00:00 - 23:59" : "All Day";
    return `${start} - ${end}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-sm border border-slate-200 bg-white shadow-xl">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <DialogTitle className="font-bold text-xs text-slate-800">
            Sep {dayNum}, 2026 ({events.length} events)
          </DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-slate-700 font-bold"
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
                ev.colorBorder
              )}
            >
              <div className={cn("font-bold", ev.colorText)}>{ev.title}</div>
              <div className="text-[10px] text-slate-600">
                {formatTime(ev.startTime, ev.endTime)}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}