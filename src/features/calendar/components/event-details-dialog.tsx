import * as React from "react";
import { Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendar";

interface EventDetailsDialogProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (eventId: string) => void;
  is24HourMode: boolean;
}

export function EventDetailsDialog({
  event,
  open,
  onOpenChange,
  onDelete,
  is24HourMode,
}: EventDetailsDialogProps) {
  if (!event) return null;

  const formatTime = (timeStr: string) => {
    if (!timeStr || is24HourMode) return timeStr;
    const parts = timeStr.split(":");
    let h = parseInt(parts[0], 10);
    const m = parts[1] || "00";
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  const handleDelete = () => {
    onDelete(event.id);
    toast.success("Event successfully removed.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-md border border-slate-200 bg-white shadow-2xl">
        <div className="px-6 py-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <DialogTitle className="font-bold text-sm text-[#17283C]">
            {event.title}
          </DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-slate-700"
          >
            <Icon icon={X} size={16} />
          </button>
        </div>

        <div className="p-6 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Category:</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded font-semibold text-[11px]",
                event.colorBg,
                event.colorText
              )}
            >
              {event.category}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Date:</span>
            <span className="font-bold text-slate-800">
              September {event.day}, {event.year}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Time Window:</span>
            <span className="font-bold text-slate-800">
              {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-slate-500 font-medium block mb-1">
              Details &amp; Context:
            </span>
            <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 leading-relaxed italic">
              {event.desc || "No specific sub-description provided."}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded border border-red-200 font-medium flex items-center gap-1"
            >
              <Icon icon={Trash2} size={14} />
              <span>Delete</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="px-4 py-1.5 bg-[#17283C] hover:bg-[#223953] text-white rounded text-xs font-semibold"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}