import * as React from "react";
import { Target, Timer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Project } from "@/types/project";

const DEFAULT_GOAL = "Complete sprint deliverables and pass regression QA";
const fieldClass = "h-8 text-xs bg-canvas-surface";

interface SprintSettingsDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateProject?: (updated: Project) => void;
}

export function SprintSettingsDialog({
  project,
  open,
  onOpenChange,
  onUpdateProject,
}: SprintSettingsDialogProps) {
  const [sprint, setSprint] = React.useState(project.activeSprint);
  const [cadence, setCadence] = React.useState("2");
  const [goal, setGoal] = React.useState(DEFAULT_GOAL);
  const [errors, setErrors] = React.useState<{
    sprint?: string;
    goal?: string;
  }>({});

  // Start from the saved values every time the dialog opens.
  React.useEffect(() => {
    if (!open) return;
    setSprint(project.activeSprint);
    setCadence(String(project.sprintCadenceWeeks ?? 2));
    setGoal(project.sprintGoal ?? DEFAULT_GOAL);
    setErrors({});
  }, [open, project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!sprint.trim()) next.sprint = "Enter the active sprint name.";
    else if (sprint.trim().length > 50)
      next.sprint = "Sprint name must be 50 characters or fewer.";
    if (goal.trim().length > 200)
      next.goal = "Sprint target must be 200 characters or fewer.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onUpdateProject?.({
      ...project,
      activeSprint: sprint.trim(),
      sprintCadenceWeeks: Number(cadence),
      sprintGoal: goal.trim(),
    });
    toast.success("Sprint settings updated.");
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="p-5 sm:max-w-[460px]">
        <ModalHeader className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-teal-500/20 bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Icon icon={Timer} size={17} />
            </div>
            <div>
              <ModalTitle className="text-base font-semibold">
                Sprint settings
              </ModalTitle>
              <ModalDescription className="text-xs">
                The active sprint, its cadence and target for {project.name}.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-3.5 pt-1 text-xs"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="sprint-name" className="text-xs font-medium">
                Active sprint *
              </Label>
              <Input
                id="sprint-name"
                value={sprint}
                onChange={(e) => {
                  setSprint(e.target.value);
                  setErrors((p) => ({ ...p, sprint: undefined }));
                }}
                aria-invalid={!!errors.sprint}
                className={fieldClass}
              />
              <FieldError message={errors.sprint} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Sprint cadence</Label>
              <Select value={cadence} onValueChange={setCadence}>
                <SelectTrigger className={fieldClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Week Sprints</SelectItem>
                  <SelectItem value="2">2 Weeks (Standard)</SelectItem>
                  <SelectItem value="3">3 Weeks</SelectItem>
                  <SelectItem value="4">4 Weeks (Monthly)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="sprint-goal" className="text-xs font-medium">
              Current sprint target
            </Label>
            <div className="relative">
              <Icon
                icon={Target}
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="sprint-goal"
                value={goal}
                onChange={(e) => {
                  setGoal(e.target.value);
                  setErrors((p) => ({ ...p, goal: undefined }));
                }}
                aria-invalid={!!errors.goal}
                placeholder="State the primary deliverable target..."
                className={`${fieldClass} pl-8`}
              />
            </div>
            <FieldError message={errors.goal} />
          </div>

          <ModalFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-semibold">
              Save sprint
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
