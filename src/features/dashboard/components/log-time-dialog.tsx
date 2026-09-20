import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { EMPLOYEE_PRIORITIES_TABLE } from "../api/mock-data";

interface LogTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogTimeDialog({ open, onOpenChange }: LogTimeDialogProps) {
  const [selectedTask, setSelectedTask] = React.useState(
    EMPLOYEE_PRIORITIES_TABLE[0]?.id ?? "",
  );
  const [date, setDate] = React.useState("Today, Sep 18");
  const [duration, setDuration] = React.useState("1.5");
  const [summary, setSummary] = React.useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const taskObj = EMPLOYEE_PRIORITIES_TABLE.find(
      (t) => t.id === selectedTask,
    );
    const taskName = taskObj ? taskObj.title : "task";

    toast.success(`Logged ${duration}h for ${taskName}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-6 bg-canvas-surface border-border-subtle">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            Log working time
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {/* 1. Task Dropdown */}
          <div className="space-y-1.5">
            <Label
              htmlFor="task-select"
              className="text-xs font-semibold text-foreground"
            >
              Task
            </Label>
            <Select value={selectedTask} onValueChange={setSelectedTask}>
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
                onChange={(e) => setDate(e.target.value)}
                className="h-9 text-xs bg-canvas-surface"
              />
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
                step="0.25"
                min="0.25"
                max="24"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="h-9 text-xs bg-canvas-surface"
              />
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
            <textarea
              id="work-summary"
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief explanation of work done..."
              className="w-full rounded-md border border-input bg-canvas-surface p-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          {/* 4. Footer Buttons */}
          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
