import { Card } from "@/components/ui/card";
import type { Project, ProjectMember } from "@/types/project";
import type { UserRole } from "@/app/providers";

interface SummaryKpiBarProps {
  project: Project;
  selectedMember: ProjectMember | null;
  userRole?: UserRole;
}

export function SummaryKpiBar({
  project,
  selectedMember,
  userRole,
}: SummaryKpiBarProps) {
  const isEmployeeMode = userRole === "employee" || !!selectedMember;

  // Aggregate project-wide vs member-specific metrics
  const estimatedHours =
    isEmployeeMode && selectedMember
      ? Math.round(
          project.estimatedHours *
            (selectedMember.assignedTasksCount /
              Math.max(1, project.tasksCount)),
        )
      : project.estimatedHours;

  const loggedHours =
    isEmployeeMode && selectedMember
      ? selectedMember.hoursLogged
      : project.loggedHours;

  const remainingHours = Math.max(0, estimatedHours - loggedHours);
  const burnedPercent = Math.min(
    100,
    Math.round((loggedHours / Math.max(1, estimatedHours)) * 100),
  );

  const totalTasks =
    isEmployeeMode && selectedMember
      ? selectedMember.assignedTasksCount
      : project.tasksCount;

  return (
    <Card className="border-border-subtle bg-canvas-surface p-5 shadow-xs">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 sm:divide-x divide-border-subtle gap-y-4 sm:gap-y-0">
        {/* 1. PROGRESS */}
        <div className="flex flex-col justify-between pr-4">
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            {isEmployeeMode ? "My Progress" : "Progress"}
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {project.completionPercentage}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-teal-500 transition-all duration-500"
              style={{ width: `${project.completionPercentage}%` }}
            />
          </div>
        </div>

        {/* 2. FEATURES */}
        <div className="flex flex-col justify-between px-0 sm:px-4 pt-3 sm:pt-0">
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Features
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {isEmployeeMode && selectedMember
                ? selectedMember.assignedFeaturesCount
                : project.coreFeaturesCount || 5}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground truncate">
            {isEmployeeMode ? "Assigned tracks" : "4 Active • 1 Planning"}
          </p>
        </div>

        {/* 3. TASKS BREAKDOWN */}
        <div className="flex flex-col justify-between px-0 sm:px-4 pt-3 sm:pt-0">
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Tasks
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {totalTasks}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground truncate">
            {totalTasks} sprint assignments
          </p>
        </div>

        {/* 4. ESTIMATED */}
        <div className="flex flex-col justify-between px-0 sm:px-4 pt-3 sm:pt-0">
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Estimated
          </span>
          <div className="mt-1">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {estimatedHours}h
            </span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground truncate">
            Scoped by {project.activeSprint || "Sprint 4"}
          </p>
        </div>

        {/* 5. LOGGED EFFORT */}
        <div className="flex flex-col justify-between px-0 sm:px-4 pt-3 sm:pt-0">
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Logged Effort
          </span>
          <div className="mt-1">
            <span className="text-2xl font-bold tracking-tight text-teal-600 dark:text-teal-400 font-mono">
              {loggedHours.toFixed(1)}h
            </span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground truncate">
            {burnedPercent}% burned
          </p>
        </div>

        {/* 6. REMAINING */}
        <div className="flex flex-col justify-between pl-0 sm:pl-4 pt-3 sm:pt-0">
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Remaining
          </span>
          <div className="mt-1">
            <span className="text-2xl font-bold tracking-tight text-amber-500 dark:text-amber-400 font-mono">
              {remainingHours.toFixed(1)}h
            </span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground truncate">
            On schedule for {project.dueDate}
          </p>
        </div>
      </div>
    </Card>
  );
}
