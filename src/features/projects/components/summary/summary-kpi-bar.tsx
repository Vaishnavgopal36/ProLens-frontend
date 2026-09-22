import { KpiCard } from "@/components/composed";
import type { Project, ProjectMember } from "@/types/project";
import type { UserRole } from "@/app/providers";

interface SummaryKpiBarProps {
  project: Project;
  selectedMembers: ProjectMember[];
  userRole?: UserRole;
}

export function SummaryKpiBar({
  project,
  selectedMembers,
  userRole,
}: SummaryKpiBarProps) {
  // Several people selected: show their combined numbers.
  const selectedMember =
    selectedMembers.length > 0
      ? {
          assignedTasksCount: selectedMembers.reduce(
            (n, m) => n + m.assignedTasksCount,
            0,
          ),
          assignedFeaturesCount: selectedMembers.reduce(
            (n, m) => n + m.assignedFeaturesCount,
            0,
          ),
          hoursLogged: selectedMembers.reduce((n, m) => n + m.hoursLogged, 0),
        }
      : null;
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

  const coreFeatures =
    isEmployeeMode && selectedMember
      ? selectedMember.assignedFeaturesCount
      : project.coreFeaturesCount || 5;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {/* 1. PROGRESS */}
      <KpiCard
        label={isEmployeeMode ? "My Progress" : "Progress"}
        value={`${project.completionPercentage}%`}
        subtext={`${project.completionPercentage}% complete`}
        sparklineData={[
          Math.max(0, project.completionPercentage - 20),
          Math.max(0, project.completionPercentage - 12),
          Math.max(0, project.completionPercentage - 5),
          project.completionPercentage,
        ]}
        strokeColor="text-teal-500 dark:text-teal-400 stroke-teal-500 dark:stroke-teal-400"
      />

      {/* 2. FEATURES */}
      <KpiCard
        label="Features"
        value={coreFeatures}
        subtext={isEmployeeMode ? "Assigned tracks" : "4 Active • 1 Planning"}
        hasTelemetry={false}
      />

      {/* 3. TASKS */}
      <KpiCard
        label="Tasks"
        value={totalTasks}
        subtext={`${totalTasks} sprint items`}
        sparklineData={[
          Math.max(0, totalTasks - 4),
          Math.max(0, totalTasks - 2),
          totalTasks,
        ]}
      />

      {/* 4. ESTIMATED */}
      <KpiCard
        label="Estimated"
        value={`${estimatedHours}h`}
        subtext={project.activeSprint || "Sprint 4"}
        hasTelemetry={false}
      />

      {/* 5. LOGGED EFFORT */}
      <KpiCard
        label="Logged Effort"
        value={`${loggedHours.toFixed(1)}h`}
        subtext={`${burnedPercent}% burned`}
        sparklineData={[
          Math.round(loggedHours * 0.35),
          Math.round(loggedHours * 0.6),
          Math.round(loggedHours * 0.85),
          loggedHours,
        ]}
        strokeColor="text-teal-500 dark:text-teal-400 stroke-teal-500 dark:stroke-teal-400"
      />

      {/* 6. REMAINING */}
      <KpiCard
        label="Remaining"
        value={`${remainingHours.toFixed(1)}h`}
        subtext={`Due ${project.dueDate}`}
        sparklineData={[
          estimatedHours,
          Math.round(estimatedHours * 0.7),
          Math.round(remainingHours * 1.1),
          remainingHours,
        ]}
        strokeColor={
          remainingHours === 0
            ? "text-emerald-500 dark:text-emerald-400 stroke-emerald-500 dark:stroke-emerald-400"
            : "text-amber-500 dark:text-amber-400 stroke-amber-500 dark:stroke-amber-400"
        }
      />
    </div>
  );
}
