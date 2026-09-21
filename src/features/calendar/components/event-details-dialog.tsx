import * as React from "react";
import { CalendarDays, CalendarOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
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
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="p-5 sm:max-w-md">
        <ModalHeader className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-teal-500/20 bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Icon
                icon={event.category === "Leave" ? CalendarOff : CalendarDays}
                size={17}
              />
            </div>
            <div className="min-w-0">
              <ModalTitle className="truncate text-base font-semibold">
                {event.title}
              </ModalTitle>
              <ModalDescription className="text-xs">
                {event.category === "Leave" ? "Leave details" : "Event details"}
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <div className="space-y-3 pt-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-medium text-muted-foreground">Category</span>
            <span
              className={cn(
                "rounded px-2 py-0.5 text-2xs font-semibold",
                event.colorBg,
                event.colorText,
              )}
            >
              {event.category}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-muted-foreground">Date</span>
            <span className="font-semibold text-foreground">
              {new Date(event.year, event.month, event.day).toLocaleDateString(
                "en-US",
                { month: "long", day: "numeric", year: "numeric" },
              )}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-muted-foreground">
              Time window
            </span>
            <span className="font-semibold tabular-nums text-foreground">
              {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </span>
          </div>

          <div className="space-y-1 border-t border-border-subtle pt-3">
            <span className="block font-medium text-muted-foreground">
              Details &amp; context
            </span>
            <p className="rounded border border-border-subtle bg-canvas-bg p-2.5 leading-relaxed text-foreground">
              {event.desc || "No specific sub-description provided."}
            </p>
          </div>

          <ModalFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
              className="mr-auto gap-1.5 text-destructive"
            >
              <Icon icon={Trash2} size={14} />
              <span>Delete</span>
            </Button>
            <Button type="button" size="sm" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </ModalFooter>
        </div>
      </ModalContent>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Event"
        description={`Are you sure you want to delete "${event.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </Modal>
  );
}
