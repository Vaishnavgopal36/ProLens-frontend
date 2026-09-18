import * as React from "react";
import { useAuth } from "@/app/providers";
import type { Project } from "@/types/project";
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
  selectedMemberId: string | null;
  onNavigateTab: (tabValue: string) => void;
}

export function SummaryTab({
  project,
  selectedMemberId,
  onNavigateTab,
}: SummaryTabProps) {
  const { user } = useAuth();
  const isManager =
    user?.role === "manager" ||
    user?.role === "admin" ||
    user?.role === "super_admin";

  // Find active member entity if header avatar filter is clicked
  const selectedMember = React.useMemo(() => {
    if (!selectedMemberId) return null;
    return project.members.find((m) => m.id === selectedMemberId) ?? null;
  }, [project.members, selectedMemberId]);

  return (
    <div className="space-y-5">
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
        <div className="lg:col-span-5 space-y-5">
          <RecentActivityCard />
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
