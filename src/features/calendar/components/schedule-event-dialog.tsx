import * as React from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { HotkeyHint } from "@/components/ui/hotkey-hint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import { CATEGORY_COLOR_MAP } from "../api/mock-data";
import type { CalendarEvent, EventCategory } from "@/types/calendar";

interface ScheduleEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  onAddEvent: (event: CalendarEvent) => void;
}

export function ScheduleEventDialog({
  open,
  onOpenChange,
  defaultDate = "2026-09-12",
  onAddEvent,
}: ScheduleEventDialogProps) {
  const [title, setTitle] = React.useState("");
  const [date, setDate] = React.useState(defaultDate);
  const [category, setCategory] = React.useState<EventCategory>("Meeting");
  const [startTime, setStartTime] = React.useState("10:00");
  const [endTime, setEndTime] = React.useState("11:30");
  const [location, setLocation] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [errors, setErrors] = React.useState<{
    title?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  }>({});
  const clearError = (key: keyof typeof errors) =>
    setErrors((prev) => ({ ...prev, [key]: undefined }));

  React.useEffect(() => {
    if (!open) setErrors({});
  }, [open]);

  React.useEffect(() => {
    if (defaultDate) setDate(defaultDate);
  }, [defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!title.trim()) next.title = "Enter an event title.";
    else if (title.trim().length > 100)
      next.title = "Title must be 100 characters or fewer.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)))
      next.date = "Choose a valid date.";
    if (!startTime) next.startTime = "Choose a start time.";
    if (!endTime) next.endTime = "Choose an end time.";
    else if (startTime && endTime <= startTime)
      next.endTime = "End time must be after the start time.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const [y, m, d] = date.split("-").map(Number);
    const styling = CATEGORY_COLOR_MAP[category] || CATEGORY_COLOR_MAP.Meeting;

    const newEvt: CalendarEvent = {
      id: `evt-${Date.now()}`,
      day: d,
      month: m - 1,
      year: y,
      title,
      startTime,
      endTime,
      category,
      desc,
      location,
      colorBg: styling.bg,
      colorText: styling.text,
      colorBorder: styling.border,
      overflowCount: 0,
    };

    onAddEvent(newEvt);
    toast.success(`Added "${title}"!`);
    setTitle("");
    setDesc("");
    setLocation("");
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="p-5 sm:max-w-[500px]">
        <ModalHeader className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div>
              <ModalTitle className="text-base font-semibold">
                Schedule New Event
              </ModalTitle>
              <ModalDescription className="text-xs">
                Add a meeting, workshop or launch to the calendar.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 pt-1 text-xs"
        >
          <div>
            <Label htmlFor="event-title" className="text-xs font-medium">
              Event Title *
            </Label>
            <Input
              id="event-title"
              placeholder="e.g., Client Retrospective"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                clearError("title");
              }}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "event-title-error" : undefined}
              className="h-8 text-xs bg-canvas-surface"
            />
            <FieldError
              id="event-title-error"
              message={errors.title}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event-date" className="text-xs font-medium">
                Date *
              </Label>
              <Input
                id="event-date"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  clearError("date");
                }}
                aria-invalid={!!errors.date}
                aria-describedby={errors.date ? "event-date-error" : undefined}
                className="h-8 text-xs bg-canvas-surface"
              />
              <FieldError
                id="event-date-error"
                message={errors.date}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Category / Theme *</Label>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val as EventCategory)}
              >
                <SelectTrigger className="h-8 text-xs bg-canvas-surface">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Meeting">Meeting (Blue)</SelectItem>
                  <SelectItem value="Client">Client Call (Green)</SelectItem>
                  <SelectItem value="Workshop">Workshop (Purple)</SelectItem>
                  <SelectItem value="Marketing">
                    Ads / Campaign (Yellow)
                  </SelectItem>
                  <SelectItem value="Launch">
                    Sprint / Launch (Rose/Red)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event-start" className="text-xs font-medium">
                Start Time *
              </Label>
              <Input
                id="event-start"
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  clearError("startTime");
                  clearError("endTime");
                }}
                aria-invalid={!!errors.startTime}
                aria-describedby={
                  errors.startTime ? "event-start-error" : undefined
                }
                className="h-8 text-xs bg-canvas-surface"
              />
              <FieldError
                id="event-start-error"
                message={errors.startTime}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="event-end" className="text-xs font-medium">
                End Time *
              </Label>
              <Input
                id="event-end"
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  clearError("endTime");
                }}
                aria-invalid={!!errors.endTime}
                aria-describedby={
                  errors.endTime ? "event-end-error" : undefined
                }
                className="h-8 text-xs bg-canvas-surface"
              />
              <FieldError
                id="event-end-error"
                message={errors.endTime}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="event-loc" className="text-xs font-medium">
              Location / Room
            </Label>
            <Input
              id="event-loc"
              placeholder="e.g., Conf Room B / Zoom"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-8 text-xs bg-canvas-surface"
            />
          </div>

          <div>
            <Label htmlFor="event-desc" className="text-xs font-medium">
              Description / Notes
            </Label>
            <Input
              id="event-desc"
              placeholder="e.g., AdSense + FB, Target A..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="h-8 text-xs bg-canvas-surface"
            />
          </div>

          <ModalFooter className="pt-2">
            <HotkeyHint className="mr-auto" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              className="gap-1.5 font-semibold"
            >
              <Icon icon={Plus} size={14} />
              <span>Save Event</span>
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
