import * as React from "react";
import { useAuth } from "@/app/providers";
import type { Project } from "@/types/project";
import { PeopleFilter } from "@/components/composed/filters/people-filter";
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
  const isManager =
    user?.role === "manager" ||
    user?.role === "admin" ||
    user?.role === "super_admin";

  // Employees always see their own numbers. Managers and above can pick a
  // teammate with the people filter to see theirs instead.
  const [pickedMemberId, setPickedMemberId] = React.useState<string | null>(
    null,
  );
  const selectedMember = React.useMemo(() => {
    if (user?.role === "employee")
      return project.members.find((m) => m.email === user.email) ?? null;
    return project.members.find((m) => m.id === pickedMemberId) ?? null;
  }, [project.members, pickedMemberId, user]);

  return (
    <div className="space-y-5">
      {user?.role !== "employee" && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Filter by person
          </span>
          <PeopleFilter
            multiple={false}
            options={project.members.map((m) => ({
              value: m.id,
              label: m.name,
              initials: m.initials,
              avatarUrl: m.avatarUrl,
            }))}
            value={pickedMemberId ? [pickedMemberId] : []}
            onChange={(v) => setPickedMemberId(v[0] ?? null)}
          />
          {pickedMemberId && (
            <button
              type="button"
              onClick={() => setPickedMemberId(null)}
              className="flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      {/* 6-Metric KPI Ribbon dynamically responding to Role & Filter */}
      <SummaryKpiBar
        project={project}
        selectedMember={selectedMember}
        userRole={user?.role}
      />

      {/* 2-Column Responsive Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Feature Tracks & Upcoming Deliverables */}
        <div className="lg:col-span-7 space-y-5">
          <FeatureOverviewCard onViewAll={() => onNavigateTab("features")} />
          <UpcomingMilestonesCard
            selectedMember={selectedMember}
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
            userRole={user?.role}
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
