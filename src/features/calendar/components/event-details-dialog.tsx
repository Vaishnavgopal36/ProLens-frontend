import * as React from "react";
import { Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ConfirmDialog } from "@/components/composed/confirm-dialog";
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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);

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
      <DialogContent className="overflow-hidden p-0 sm:max-w-md border border-border-subtle bg-canvas-surface shadow-2xl">
        <div className="px-6 py-4 bg-muted border-b border-border-subtle flex items-center justify-between">
          <DialogTitle className="font-bold text-sm text-foreground">
            {event.title}
          </DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <Icon icon={X} size={16} />
          </button>
        </div>

        <div className="p-6 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Category:</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded font-semibold text-2xs",
                event.colorBg,
                event.colorText,
              )}
            >
              {event.category}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Date:</span>
            <span className="font-bold text-foreground">
              September {event.day}, {event.year}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">
              Time Window:
            </span>
            <span className="font-bold text-foreground">
              {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </span>
          </div>

          <div className="pt-2 border-t border-border-subtle">
            <span className="text-muted-foreground font-medium block mb-1">
              Details &amp; Context:
            </span>
            <p className="text-foreground bg-canvas-bg p-2.5 rounded border border-border-subtle leading-relaxed italic">
              {event.desc || "No specific sub-description provided."}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
              className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive gap-1"
            >
              <Icon icon={Trash2} size={14} />
              <span>Delete</span>
            </Button>
            <Button type="button" size="sm" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Event"
        description={`Are you sure you want to delete "${event.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </Dialog>
  );
}
