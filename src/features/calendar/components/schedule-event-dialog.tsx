import * as React from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  React.useEffect(() => {
    if (defaultDate) setDate(defaultDate);
  }, [defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter an event title");
      return;
    }

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[500px] border border-border-subtle bg-canvas-surface">
        <div className="flex items-center justify-between bg-navy-500 px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <Icon
              icon={Plus}
              size={16}
              className="text-teal-500 dark:text-teal-400"
            />
            <DialogTitle className="text-sm font-bold text-white tracking-tight">
              Schedule New Event
            </DialogTitle>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="text-white/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <Icon icon={X} size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 text-xs">
          <div>
            <Label
              htmlFor="event-title"
              className="block text-xs font-semibold text-foreground mb-1"
            >
              Event Title *
            </Label>
            <Input
              id="event-title"
              placeholder="e.g., Client Retrospective"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 text-xs border-border-subtle rounded bg-canvas-surface"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="event-date"
                className="block text-xs font-semibold text-foreground mb-1"
              >
                Date *
              </Label>
              <Input
                id="event-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 text-xs border-border-subtle rounded bg-canvas-surface"
                required
              />
            </div>
            <div>
              <Label className="block text-xs font-semibold text-foreground mb-1">
                Category / Theme *
              </Label>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val as EventCategory)}
              >
                <SelectTrigger className="h-9 text-xs border-border-subtle rounded bg-canvas-surface">
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
              <Label
                htmlFor="event-start"
                className="block text-xs font-semibold text-foreground mb-1"
              >
                Start Time *
              </Label>
              <Input
                id="event-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-9 text-xs border-border-subtle rounded bg-canvas-surface"
                required
              />
            </div>
            <div>
              <Label
                htmlFor="event-end"
                className="block text-xs font-semibold text-foreground mb-1"
              >
                End Time *
              </Label>
              <Input
                id="event-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-9 text-xs border-border-subtle rounded bg-canvas-surface"
                required
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="event-loc"
              className="block text-xs font-semibold text-foreground mb-1"
            >
              Location / Room
            </Label>
            <Input
              id="event-loc"
              placeholder="e.g., Conf Room B / Zoom"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-9 text-xs border-border-subtle rounded bg-canvas-surface"
            />
          </div>

          <div>
            <Label
              htmlFor="event-desc"
              className="block text-xs font-semibold text-foreground mb-1"
            >
              Description / Notes
            </Label>
            <Input
              id="event-desc"
              placeholder="e.g., AdSense + FB, Target A..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="h-9 text-xs border-border-subtle rounded bg-canvas-surface"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-border-subtle">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 border-border-subtle text-muted-foreground hover:bg-canvas-bg text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8 bg-navy-900 hover:bg-navy-500 text-white text-xs font-semibold shadow-sm border border-amber-500/30 hover:border-amber-400 flex items-center space-x-1.5"
            >
              <span className="text-amber-400 font-bold">+</span>
              <span>Save Event</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
