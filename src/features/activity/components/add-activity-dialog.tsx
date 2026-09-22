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
import type {
  ActivityCardItem,
  ActivityType,
  ActivityDetailTask,
} from "@/types/activity";

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: ActivityCardItem) => void;
}

const PROJECT_OPTIONS = [
  "Website Redesign",
  "Mobile App v2.0",
  "Cloud Migration",
  "Design System Rollout",
];

const NON_PROJECT_STREAMS = [
  "General & Ops",
  "Client Success",
  "Knowledge Base",
  "Internal Learning",
];

export function AddActivityDialog({
  open,
  onOpenChange,
  onAdd,
}: AddActivityDialogProps) {
  const [type, setType] = React.useState<ActivityType>("project");
  const [title, setTitle] = React.useState("");
  const [projectName, setProjectName] = React.useState("Website Redesign");
  const [streamName, setStreamName] = React.useState("General & Ops");
  const [scheduledDate, setScheduledDate] = React.useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [startTime, setStartTime] = React.useState("10:00");
  const [durationHours, setDurationHours] = React.useState("2");
  const [durationMinutes, setDurationMinutes] = React.useState("0");
  const [taskInput, setTaskInput] = React.useState("");
  const [description, setDescription] = React.useState("");

  const formatTime12h = (hours: number, minutes: number) => {
    const period = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    return `${h12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const getReadableDuration = () => {
    const h = parseInt(durationHours, 10) || 0;
    const m = parseInt(durationMinutes, 10) || 0;
    const parts: string[] = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    return parts.length > 0 ? parts.join(" ") : "0m";
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
      toast.error("Please enter a duration greater than 0 minutes.");
      return;
    }

    const [startH, startM] = startTime.split(":").map(Number);
    const startFormatted = formatTime12h(startH, startM);
    const endFormatted = getCalculatedEndTime();
    const readableDur = getReadableDuration();

    // Format human-readable date e.g. "Sep 22, 2026"
    const parsedDate = new Date(scheduledDate + "T00:00:00");
    const displayDate = parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    // Parse tasks into interactive checklist items for the detail page
    const parsedTasks: ActivityDetailTask[] = taskInput.trim()
      ? taskInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .map((tTitle, idx) => ({
            id: `task-${Date.now()}-${idx}`,
            title: tTitle,
            duration: "—",
            scope: "Task logged via activity schedule.",
            completed: false,
            subtasks: [
              {
                id: `st-${Date.now()}-${idx}-1`,
                title: "Requirement setup & execution",
                completed: false,
              },
            ],
          }))
      : [
          {
            id: `task-${Date.now()}-default`,
            title: "Initial Deliverable Sync",
            duration: readableDur,
            scope: description.trim() || "Initial scope review.",
            completed: false,
            subtasks: [
              {
                id: `st-${Date.now()}-default-1`,
                title: "Complete session action items",
                completed: false,
              },
            ],
          },
        ];

    const newItem: ActivityCardItem = {
      id: `act-${Date.now()}`,
      type,
      title: title.trim(),
      projectName: type === "project" ? projectName : undefined,
      streamName: type === "non-project" ? streamName : undefined,
      referenceCode: `REF-${type === "project" ? "PRJ" : "OPS"}-${Date.now().toString().slice(-4)}`,
      date: displayDate,
      scheduledTime: `${startFormatted} – ${endFormatted}`,
      duration: readableDur,
      loggedHours: readableDur,
      tasksCount: parsedTasks.length,
      taskTag: type === "project" ? "Sprint Activity" : "Operations",
      priority: "High",
      assignedLead: {
        name: "Lakshitha",
        initials: "LK",
        role: "UI Designer",
      },
      members: ["LK"],
      description:
        description.trim() ||
        "Activity session details and sprint deliverables recorded.",
      tasks: parsedTasks,
    };

    onAdd(newItem);
    toast.success("Activity added successfully.");
    onOpenChange(false);

    // Reset Form
    setTitle("");
    setDescription("");
    setTaskInput("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto p-6 bg-canvas-surface border-border-subtle">
        <DialogHeader className="border-b border-border-subtle pb-3">
          <DialogTitle className="text-base font-bold text-foreground">
            Add Activity
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Schedule and configure deliverables for your activity session.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
          {/* 1. Activity Title */}
          <div className="space-y-1.5">
            <Label htmlFor="add-title" className="text-xs font-semibold">
              Activity Title *
            </Label>
            <Input
              id="add-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. UI Design Review"
              className="h-9 text-xs"
              required
            />
          </div>

          {/* 2. Type Selector (Radio Pills) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Activity Classification</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("project")}
                className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  type === "project"
                    ? "border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400"
                    : "border-border-subtle bg-canvas-bg text-muted-foreground hover:text-foreground"
                }`}
              >
                Project Activity
              </button>
              <button
                type="button"
                onClick={() => setType("non-project")}
                className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  type === "non-project"
                    ? "border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400"
                    : "border-border-subtle bg-canvas-bg text-muted-foreground hover:text-foreground"
                }`}
              >
                Non-Project Activity
              </button>
            </div>
          </div>

          {/* 3. Project / Stream dropdown */}
          {type === "project" ? (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Target Project</Label>
              <Select value={projectName} onValueChange={setProjectName}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Operational Stream</Label>
              <Select value={streamName} onValueChange={setStreamName}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NON_PROJECT_STREAMS.map((s) => (
                    <SelectItem key={s} value={s} className="text-xs">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 4. Date, Time, Duration container */}
          <div className="rounded-xl border border-border-subtle bg-canvas-bg/50 p-3.5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="add-date" className="text-xs font-semibold">
                  Date
                </Label>
                <Input
                  id="add-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-start" className="text-xs font-semibold">
                  Start Time
                </Label>
                <Input
                  id="add-start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-8 text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Duration</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={durationHours} onValueChange={setDurationHours}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Hours" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 9 }, (_, i) => (
                      <SelectItem key={i} value={String(i)} className="text-xs">
                        {i} {i === 1 ? "hour" : "hours"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={durationMinutes} onValueChange={setDurationMinutes}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Minutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0" className="text-xs">0 mins</SelectItem>
                    <SelectItem value="15" className="text-xs">15 mins</SelectItem>
                    <SelectItem value="30" className="text-xs">30 mins</SelectItem>
                    <SelectItem value="45" className="text-xs">45 mins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-canvas-surface px-3 py-1.5 text-[11px] text-muted-foreground border border-border-subtle">
              <span>
                Window:{" "}
                <strong className="text-foreground">
                  {startTime
                    ? formatTime12h(
                        ...(startTime.split(":").map(Number) as [number, number])
                      )
                    : ""}{" "}
                  – {getCalculatedEndTime()}
                </strong>
              </span>
              <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
                {getReadableDuration()}
              </Badge>
            </div>
          </div>

          {/* 5. Tasks / Deliverables (Comma separated) */}
          <div className="space-y-1.5">
            <Label htmlFor="add-tasks" className="text-xs font-semibold">
              Tasks / Deliverables (comma-separated)
            </Label>
            <Input
              id="add-tasks"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="e.g. Homepage Redesign, Responsive Check, Nav Update"
              className="h-9 text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              These will generate collapsible tasks with checklist items in the detail view.
            </p>
          </div>

          {/* 6. Description */}
          <div className="space-y-1.5">
            <Label htmlFor="add-desc" className="text-xs font-semibold">
              Session Scope &amp; Brief
            </Label>
            <Textarea
              id="add-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of objectives, attendees, or design review notes..."
              className="text-xs resize-none"
            />
          </div>

          {/* Actions */}
          <DialogFooter className="pt-2 border-t border-border-subtle flex items-center justify-end gap-2">
            <HotkeyHint className="mr-auto" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              className="text-xs h-8 font-semibold bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600"
            >
              Save Activity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}