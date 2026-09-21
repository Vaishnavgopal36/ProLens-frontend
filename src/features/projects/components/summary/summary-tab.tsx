import * as React from "react";
import { useAuth } from "@/app/providers";
import { usePermissions } from "@/hooks/use-permissions";
import type { Project, ProjectMember } from "@/types/project";
import {
  FilterBar,
  useFilters,
  type FilterFieldDef,
} from "@/components/composed/filters";
import { SummaryKpiBar } from "./summary-kpi-bar";
import { FeatureOverviewCard } from "./feature-overview-card";
import { UpcomingMilestonesCard } from "./upcoming-milestones-card";
import { RecentActivityCard } from "./recent-activity-card";
import { ProjectTeamWidget } from "./project-team-widget";
import { TypesOfWorkCard } from "./types-of-work-card";
import { PriorityBreakdownCard } from "./priority-breakdown-card";
import { TeamWorkloadCard } from "./team-workload-card";

interface SummaryTabProps {
  project: Project;
  onNavigateTab: (tabValue: string) => void;
}

export function SummaryTab({ project, onNavigateTab }: SummaryTabProps) {
  const { user } = useAuth();
  const { isEmployee, hasMinimumRole } = usePermissions();
  const isManager = hasMinimumRole("manager");

  // Employees always see their own numbers. Managers and above can pick one
  // or several teammates with the filter; the cards then show their combined
  // numbers.
  const fields = React.useMemo<FilterFieldDef<ProjectMember>[]>(
    () => [
      {
        key: "assignee",
        label: "Assignee",
        kind: "people",
        options: project.members.map((m) => ({
          value: m.id,
          label: m.name,
          initials: m.initials,
          avatarUrl: m.avatarUrl,
        })),
        accessor: (m) => m.id,
      },
    ],
    [project.members],
  );
  const filters = useFilters(project.members, fields);
  const pickedIds = filters.selected.assignee;
  const selectedMembers = React.useMemo(() => {
    if (isEmployee)
      return project.members.filter((m) => m.email === user?.email);
    return project.members.filter((m) => pickedIds?.includes(m.id));
  }, [project.members, pickedIds, isEmployee, user?.email]);

  return (
    <div className="space-y-5">
      {!isEmployee && <FilterBar filters={filters} />}

      {/* 6-Metric KPI Ribbon dynamically responding to Role & Filter */}
      <SummaryKpiBar
        project={project}
        selectedMembers={selectedMembers}
        userRole={user?.role}
      />

      {/* 2-Column Responsive Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Feature Tracks & Upcoming Deliverables */}
        <div className="lg:col-span-7 space-y-5">
          <FeatureOverviewCard onViewAll={() => onNavigateTab("features")} />
          <UpcomingMilestonesCard
            selectedMembers={selectedMembers}
            activeSprintName={project.activeSprint}
            onNavigateTab={onNavigateTab}
          />
        </div>

        {/* Right Column (5 cols): Activity Stream & Team Governance */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {isManager && <RecentActivityCard />}
          <ProjectTeamWidget
            project={project}
            onManageClick={() => onNavigateTab("teams")}
          />
        </div>
      </div>

      {/* Analytics Row: work composition & priority mix, side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TypesOfWorkCard
          coreFeaturesCount={project.coreFeaturesCount}
          onNavigateTab={onNavigateTab}
        />
        <PriorityBreakdownCard onNavigateTab={onNavigateTab} />
      </div>

      {/* Manager-only: per-person workload is not shown to employees */}
      {isManager && <TeamWorkloadCard members={project.members} />}
    </div>
  );
}
