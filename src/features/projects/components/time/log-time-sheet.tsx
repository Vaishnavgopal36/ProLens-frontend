import * as React from "react";
import { Clock3, CalendarIcon } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/modal";
import { HotkeyHint } from "@/components/ui/hotkey-hint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { toLocalISODate } from "@/lib/date";
import { toast } from "sonner";
import type { TimeFeatureGroup } from "./mock-data";

interface LogTimeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  features: TimeFeatureGroup[];
  onLogTime: (taskId: string, hours: number) => void;
}

export function LogTimeSheet({
  open,
  onOpenChange,
  features,
  onLogTime,
}: LogTimeSheetProps) {
  const [featureId, setFeatureId] = React.useState("");
  const [taskId, setTaskId] = React.useState("");
  const [hours, setHours] = React.useState("");
  const [date, setDate] = React.useState(toLocalISODate());
  const [notes, setNotes] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  // Always start on today's date when the sheet opens.
  React.useEffect(() => {
    if (open) setDate(toLocalISODate());
  }, [open]);

  const selectedFeature = features.find((f) => f.id === featureId);
  const taskOptions = selectedFeature?.tasks ?? [];

  const resetForm = () => {
    setFeatureId("");
    setTaskId("");
    setHours("");
    setDate(toLocalISODate());
    setNotes("");
    setError(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!taskId) {
      setError("Select a task to log time against.");
      return;
    }

    const parsedHours = Number(hours);
    if (!hours || Number.isNaN(parsedHours) || parsedHours <= 0) {
      setError("Enter a valid number of hours.");
      return;
    }

    onLogTime(taskId, parsedHours);
    const task = taskOptions.find((t) => t.id === taskId);
    toast.success(`Logged ${parsedHours}h on ${task?.code ?? "task"}`);
    resetForm();
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        onOpenChange(next);
      }}
    >
      <ModalContent className="sm:max-w-md w-full overflow-y-auto p-5">
        <ModalHeader className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 shrink-0">
              <Icon icon={Clock3} size={17} />
            </div>
            <div>
              <ModalTitle className="text-base font-semibold">
                Log Time
              </ModalTitle>
              <ModalDescription className="text-xs">
                Record hours worked against a task.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-4">
          <div className="space-y-1">
            <Label className="text-xs font-medium">Feature *</Label>
            <Select
              value={featureId}
              onValueChange={(val) => {
                setFeatureId(val);
                setTaskId("");
                if (error) setError(null);
              }}
            >
              <SelectTrigger className="h-9 text-sm bg-canvas-surface">
                <SelectValue placeholder="Select a feature" />
              </SelectTrigger>
              <SelectContent>
                {features.map((feature) => (
                  <SelectItem key={feature.id} value={feature.id}>
                    {feature.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label
              className={cn(
                "text-xs font-medium",
                error && !taskId && "text-destructive",
              )}
            >
              Task *
            </Label>
            <Select
              value={taskId}
              onValueChange={(val) => {
                setTaskId(val);
                if (error) setError(null);
              }}
              disabled={!featureId}
            >
              <SelectTrigger
                className={cn(
                  "h-9 text-sm bg-canvas-surface",
                  error && !taskId && "border-destructive",
                )}
              >
                <SelectValue
                  placeholder={
                    featureId ? "Select a task" : "Choose a feature first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {taskOptions.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.code} — {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label
                htmlFor="log-time-hours"
                className={cn(
                  "text-xs font-medium",
                  error && (!hours || Number(hours) <= 0) && "text-destructive",
                )}
              >
                Hours *
              </Label>
              <Input
                id="log-time-hours"
                type="number"
                min="0"
                step="0.5"
                placeholder="e.g. 2.5"
                value={hours}
                onChange={(e) => {
                  setHours(e.target.value);
                  if (error) setError(null);
                }}
                className={cn(
                  "h-9 text-sm bg-canvas-surface",
                  error &&
                    (!hours || Number(hours) <= 0) &&
                    "border-destructive",
                )}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="log-time-date" className="text-xs font-medium">
                Date
              </Label>
              <div className="relative">
                <Icon
                  icon={CalendarIcon}
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                  id="log-time-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-9 pl-8 text-sm bg-canvas-surface"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-2xs font-medium text-destructive">{error}</p>
          )}

          <div className="space-y-1">
            <Label htmlFor="log-time-notes" className="text-xs font-medium">
              Notes (optional)
            </Label>
            <Textarea
              id="log-time-notes"
              rows={3}
              placeholder="What did you work on?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-input bg-canvas-surface px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
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
              variant="accent"
              size="sm"
              className="font-semibold"
            >
              Log Time
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
