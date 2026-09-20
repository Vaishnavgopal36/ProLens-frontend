import { Layers } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/app/providers";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";
import type { FeatureStream } from "./mock-data";
import { TASKS_BY_FEATURE } from "./task-mock-data";
import { PRIORITY_BADGE_CLASSES } from "@/features/projects/lib/badge-styles";

const STATUS_BADGE_CLASSES: Record<string, string> = {
  "To Do": "bg-canvas-overlay text-muted-foreground",
  "In Progress":
    "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300",
  "In Review":
    "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300",
  Done: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
};

interface FeatureDetailDialogProps {
  feature: FeatureStream | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeatureDetailDialog({
  feature,
  open,
  onOpenChange,
}: FeatureDetailDialogProps) {
  const { user } = useAuth();
  const { isEmployee } = usePermissions();

  const allTasks = feature ? (TASKS_BY_FEATURE[feature.name] ?? []) : [];
  const visibleTasks = isEmployee
    ? allTasks.filter((task) => task.assigneeName === user?.name)
    : allTasks;

  if (!feature) return null;

  const isActive = feature.status === "ACTIVE";

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-lg p-5 overflow-y-auto">
        <ModalHeader className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg border shrink-0",
                isActive
                  ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20"
                  : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
              )}
            >
              <Icon icon={Layers} size={17} />
            </div>
            <div>
              <ModalTitle className="text-base font-semibold">
                {feature.name}
              </ModalTitle>
              <ModalDescription className="text-xs">
                {feature.description}
              </ModalDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Badge
              variant="outline"
              className={
                isActive
                  ? "text-3xs px-2 py-0.5 font-bold border-teal-500/30 text-teal-600 bg-teal-500/10 dark:text-teal-400"
                  : "text-3xs px-2 py-0.5 font-bold border-amber-500/30 text-amber-700 bg-amber-500/10 dark:text-amber-400"
              }
            >
              {feature.status}
            </Badge>
            <span className="text-xs font-semibold text-muted-foreground">
              {feature.progress}% complete
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                isActive ? "bg-teal-500" : "bg-amber-500",
              )}
              style={{ width: `${feature.progress}%` }}
            />
          </div>
        </ModalHeader>

        <div className="pt-4 space-y-2.5">
          <p className="text-xs font-medium text-muted-foreground">
            {isEmployee
              ? "Showing your tasks"
              : `Showing all ${visibleTasks.length} task${visibleTasks.length === 1 ? "" : "s"}`}
          </p>

          {visibleTasks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border-subtle p-4 text-center text-xs text-muted-foreground">
              {isEmployee
                ? "You have no tasks assigned in this feature stream."
                : "No tasks in this feature stream yet."}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {visibleTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg border border-border-subtle bg-canvas-surface p-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-sm font-semibold text-foreground">
                      {task.title}
                    </h5>
                    <span
                      className={cn(
                        "shrink-0 px-2 py-0.5 rounded text-3xs font-semibold",
                        PRIORITY_BADGE_CLASSES[task.priority],
                      )}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-border-subtle text-xs">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-3xs font-semibold",
                        STATUS_BADGE_CLASSES[task.status],
                      )}
                    >
                      {task.status}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground text-2xs">
                        {task.assigneeName}
                      </span>
                      <span className="w-5 h-5 rounded-full bg-navy-500 dark:bg-foreground text-white dark:text-background flex items-center justify-center text-4xs font-bold shrink-0">
                        {task.assigneeInitials}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}
