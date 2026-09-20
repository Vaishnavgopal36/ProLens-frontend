import * as React from "react";
import { toast } from "sonner";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/modal";
import { HotkeyHint } from "@/components/ui/hotkey-hint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/ui/field-error";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EMPLOYEE_PRIORITIES_TABLE } from "../api/mock-data";

interface LogTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** e.g. "Today, Sep 20" — always the real current date. */
function todayLabel() {
  return `Today, ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export function LogTimeDialog({ open, onOpenChange }: LogTimeDialogProps) {
  const [selectedTask, setSelectedTask] = React.useState(
    EMPLOYEE_PRIORITIES_TABLE[0]?.id ?? "",
  );
  const [date, setDate] = React.useState(todayLabel);
  const [duration, setDuration] = React.useState("1.5");
  const [summary, setSummary] = React.useState("");
  const [errors, setErrors] = React.useState<{
    task?: string;
    date?: string;
    duration?: string;
    summary?: string;
  }>({});
  const clearError = (key: keyof typeof errors) =>
    setErrors((prev) => ({ ...prev, [key]: undefined }));

  React.useEffect(() => {
    if (open) setDate(todayLabel());
    else setErrors({});
  }, [open]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!selectedTask) next.task = "Select a task.";
    if (!date.trim()) next.date = "Enter the date worked.";
    const hours = Number(duration);
    if (!duration.trim() || Number.isNaN(hours))
      next.duration = "Enter the hours worked, like 1.5.";
    else if (hours < 0.25)
      next.duration = "Duration must be at least 0.25 hours.";
    else if (hours > 24) next.duration = "Duration can't exceed 24 hours.";
    else if ((hours * 4) % 1 !== 0)
      next.duration = "Use 15-minute steps, like 1.25 or 1.5.";
    if (!summary.trim()) next.summary = "Add a short summary of the work done.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const taskObj = EMPLOYEE_PRIORITIES_TABLE.find(
      (t) => t.id === selectedTask,
    );
    const taskName = taskObj ? taskObj.title : "task";

    toast.success(`Logged ${duration}h for ${taskName}`);
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-[480px] p-6 bg-canvas-surface border-border-subtle">
        <ModalHeader>
          <ModalTitle className="text-lg font-bold text-foreground">
            Log working time
          </ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSave} noValidate className="space-y-4 pt-2">
          {/* 1. Task Dropdown */}
          <div className="space-y-1.5">
            <Label
              htmlFor="task-select"
              className="text-xs font-semibold text-foreground"
            >
              Task
            </Label>
            <Select
              value={selectedTask}
              onValueChange={(v) => {
                setSelectedTask(v);
                clearError("task");
              }}
            >
              <SelectTrigger
                id="task-select"
                className="h-9 text-xs bg-canvas-surface"
              >
                <SelectValue placeholder="Select a task..." />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYEE_PRIORITIES_TABLE.map((task) => (
                  <SelectItem key={task.id} value={task.id} className="text-xs">
                    {task.title} ({task.project})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError id="task-error" message={errors.task} />
          </div>

          {/* 2. Date & Duration (Two-Column Row) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="log-date"
                className="text-xs font-semibold text-foreground"
              >
                Date
              </Label>
              <Input
                id="log-date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  clearError("date");
                }}
                aria-invalid={!!errors.date}
                aria-describedby={errors.date ? "log-date-error" : undefined}
                className="h-9 text-xs bg-canvas-surface"
              />
              <FieldError id="log-date-error" message={errors.date} />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="log-duration"
                className="text-xs font-semibold text-foreground"
              >
                Duration (hours)
              </Label>
              <Input
                id="log-duration"
                type="number"
                inputMode="decimal"
                step="0.25"
                value={duration}
                onChange={(e) => {
                  setDuration(e.target.value);
                  clearError("duration");
                }}
                aria-invalid={!!errors.duration}
                aria-describedby={
                  errors.duration ? "log-duration-error" : undefined
                }
                className="h-9 text-xs bg-canvas-surface"
              />
              <FieldError id="log-duration-error" message={errors.duration} />
            </div>
          </div>

          {/* 3. Work Summary Textarea */}
          <div className="space-y-1.5">
            <Label
              htmlFor="work-summary"
              className="text-xs font-semibold text-foreground"
            >
              Work summary
            </Label>
            <Textarea
              id="work-summary"
              rows={3}
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value);
                clearError("summary");
              }}
              aria-invalid={!!errors.summary}
              aria-describedby={
                errors.summary ? "work-summary-error" : undefined
              }
              placeholder="Brief explanation of work done..."
              className="w-full rounded-md border border-input aria-[invalid=true]:border-destructive bg-canvas-surface p-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
            <FieldError id="work-summary-error" message={errors.summary} />
          </div>

          {/* 4. Footer Buttons */}
          <ModalFooter className="pt-2 flex items-center justify-end gap-2">
            <HotkeyHint className="mr-auto" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs font-semibold h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="sm"
              className="text-xs font-semibold h-8"
            >
              Save entry
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
