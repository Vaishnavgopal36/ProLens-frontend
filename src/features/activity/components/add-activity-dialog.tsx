import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HotkeyHint } from "@/components/ui/hotkey-hint";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ActivityCategory, ActivityItem } from "@/types/activity";

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: ActivityItem) => void;
}

export function AddActivityDialog({
  open,
  onOpenChange,
  onAdd,
}: AddActivityDialogProps) {
  const [category, setCategory] = React.useState<ActivityCategory>("project");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [projectName, setProjectName] = React.useState(
    "Apex Analytics Platform",
  );

  const [scheduledDate, setScheduledDate] = React.useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [startTime, setStartTime] = React.useState("15:00");
  const [durationHours, setDurationHours] = React.useState("1");
  const [durationMinutes, setDurationMinutes] = React.useState("30");

  const formatTime12h = (hours: number, minutes: number) => {
    const period = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    return `${h12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const getReadableDuration = () => {
    const h = parseInt(durationHours, 10) || 0;
    const m = parseInt(durationMinutes, 10) || 0;
    const parts: string[] = [];
    if (h > 0) parts.push(`${h} ${h === 1 ? "hour" : "hours"}`);
    if (m > 0) parts.push(`${m} ${m === 1 ? "minute" : "minutes"}`);
    return parts.length > 0 ? parts.join(" ") : "0 minutes";
  };

  const getCalculatedEndTime = () => {
    if (!startTime) return "";
    const [startH, startM] = startTime.split(":").map(Number);
    const totalMinutes =
      startH * 60 +
      startM +
      (parseInt(durationHours, 10) || 0) * 60 +
      (parseInt(durationMinutes, 10) || 0);

    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return formatTime12h(endH, endM);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter an activity title.");
      return;
    }

    const totalMinutes =
      (parseInt(durationHours, 10) || 0) * 60 +
      (parseInt(durationMinutes, 10) || 0);

    if (totalMinutes <= 0) {
      toast.error("Please select a duration greater than 0 minutes.");
      return;
    }

    const [startH, startM] = startTime.split(":").map(Number);
    const startFormatted = formatTime12h(startH, startM);
    const endFormatted = getCalculatedEndTime();

    const newItem: ActivityItem = {
      id: `act-${Date.now()}`,
      category,
      categoryLabel:
        category === "project" ? "Project Task Completed" : "Team Meeting",
      projectName: category === "project" ? projectName : undefined,
      title: title.trim(),
      description: description.trim() || "Activity logged via workspace.",
      date: scheduledDate, // Strict YYYY-MM-DD
      timeWindow: `${startFormatted} – ${endFormatted}`,
      durationHours: getReadableDuration(),
      statusBadge: { label: "Scheduled", variant: "neutral" },
      pinColor: category === "project" ? "teal" : "navy",
      loggedBy: "Alex Morgan",
    };

    onAdd(newItem);
    toast.success("Activity scheduled successfully.");
    onOpenChange(false);
    setTitle("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-5 border-border-subtle bg-canvas-surface">
        <DialogHeader className="border-b border-border-subtle pb-3">
          <DialogTitle className="text-base font-semibold text-foreground">
            Schedule Activity
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Set date, starting time, and duration for your activity.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1 text-xs">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">
              Category
            </Label>
            <Select
              value={category}
              onValueChange={(val) => setCategory(val as ActivityCategory)}
            >
              <SelectTrigger className="h-9 text-xs border-border-subtle bg-canvas-surface">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project">Project Activity</SelectItem>
                <SelectItem value="non-project">
                  Non-Project Activity
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {category === "project" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Project
              </Label>
              <Select value={projectName} onValueChange={setProjectName}>
                <SelectTrigger className="h-9 text-xs border-border-subtle bg-canvas-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Apex Analytics Platform">
                    Apex Analytics Platform
                  </SelectItem>
                  <SelectItem value="Nova Mobile Dev">
                    Nova Mobile Dev
                  </SelectItem>
                  <SelectItem value="Internal Project">
                    Internal Project
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label
              htmlFor="activity-title"
              className="text-xs font-medium text-foreground"
            >
              Activity Title *
            </Label>
            <Input
              id="activity-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Architecture Sprint Demo"
              className="h-9 text-xs border-border-subtle bg-canvas-surface"
              required
            />
          </div>

          <div className="rounded-md border border-border-subtle bg-canvas-bg/40 p-3 space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <Label
                  htmlFor="sched-date"
                  className="text-xs font-medium text-foreground"
                >
                  Date
                </Label>
                <Input
                  id="sched-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="h-9 text-xs border-border-subtle bg-canvas-surface"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="sched-start"
                  className="text-xs font-medium text-foreground"
                >
                  Start Time
                </Label>
                <Input
                  id="sched-start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-9 text-xs border-border-subtle bg-canvas-surface"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">
                Duration
              </Label>
              <div className="grid grid-cols-2 gap-2.5">
                <Select value={durationHours} onValueChange={setDurationHours}>
                  <SelectTrigger className="h-9 text-xs border-border-subtle bg-canvas-surface">
                    <SelectValue placeholder="Hours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 hours</SelectItem>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="3">3 hours</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                    <SelectItem value="5">5 hours</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={durationMinutes}
                  onValueChange={setDurationMinutes}
                >
                  <SelectTrigger className="h-9 text-xs border-border-subtle bg-canvas-surface">
                    <SelectValue placeholder="Minutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md bg-canvas-surface px-2.5 py-1.5 text-[11px] text-muted-foreground border border-border-subtle">
              <span>
                Schedule:{" "}
                <strong className="text-foreground">
                  {startTime
                    ? formatTime12h(
                        ...(startTime.split(":").map(Number) as [
                          number,
                          number,
                        ]),
                      )
                    : ""}{" "}
                  – {getCalculatedEndTime()}
                </strong>
              </span>
              <Badge
                variant="secondary"
                className="font-semibold text-3xs px-2 py-0"
              >
                {getReadableDuration()}
              </Badge>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="activity-desc"
              className="text-xs font-medium text-foreground"
            >
              Description
            </Label>
            <Textarea
              id="activity-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of notes, outcomes, or agenda..."
              className="resize-none text-xs border-border-subtle bg-canvas-surface focus-visible:ring-1"
            />
          </div>

          <DialogFooter className="pt-2 border-t border-border-subtle flex items-center justify-end gap-2">
            <HotkeyHint className="mr-auto" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              className="text-xs h-9 font-semibold"
            >
              Save Schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
