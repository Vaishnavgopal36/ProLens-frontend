import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useModalHotkey } from "@/hooks/use-hotkey";
import { Plus, Users, CheckCircle2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KpiCard, StatusIndicator } from "@/components/composed";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Project, ProjectStatus } from "@/types/project";
import type { AdminProjectRow } from "@/types/dashboard";
import { MOCK_PROJECTS } from "@/features/projects/api/mock-data";
import { ProjectSettingsDialog } from "@/features/projects/components/project-settings-dialog";
import { CreateProjectDialog } from "@/features/projects/components/create-project-dialog";
import {
  ADMIN_METRICS,
  ADMIN_PROJECTS_TABLE,
  ADMIN_TEAM_DISTRIBUTION,
} from "../api/mock-data";
import { UpcomingActivities } from "../components/upcoming-activities";
import { useSimulatedLoading } from "@/lib/use-simulated-loading";
import {
  PageHeaderSkeleton,
  MetricCardGridSkeleton,
  TableSkeleton,
  CardListSkeleton,
} from "@/components/composed/skeletons";

const ROW_STATUS: Record<ProjectStatus, AdminProjectRow["status"]> = {
  ongoing: "Active",
  pending: "On-hold",
  completed: "Active",
};

function projectForRow(row: AdminProjectRow): Project {
  const known = MOCK_PROJECTS.find((p) => p.name === row.name);
  if (known) return known;
  return {
    id: row.id,
    name: row.name,
    client: row.client,
    description: row.subname,
    status: row.status === "On-hold" ? "pending" : "ongoing",
    lead: row.manager,
    activeSprint: "Sprint 1: Active",
    dateRange: "",
    dueDate: "Q4 2026",
    completionPercentage: 0,
    estimatedHours: Math.max(Math.round(row.hoursLogged * 1.5), 100),
    loggedHours: row.hoursLogged,
    tasksCount: 0,
    coreFeaturesCount: 0,
    pendingInvites: [],
    members: [],
  };
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [editingRow, setEditingRow] = React.useState<AdminProjectRow | null>(
    null,
  );
  const isLoading = useSimulatedLoading();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [projectRows, setProjectRows] = React.useState(ADMIN_PROJECTS_TABLE);

  useModalHotkey({
    open: createOpen,
    onOpen: () => setCreateOpen(true),
    onClose: () => setCreateOpen(false),
  });

  const handleCreateProject = (project: Project) => {
    setProjectRows((prev) => [
      {
        id: project.id,
        name: project.name,
        subname: project.client,
        client: project.client,
        manager: project.lead,
        status: "Active",
        hoursLogged: 0,
      },
      ...prev,
    ]);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton withAction />
        <MetricCardGridSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <TableSkeleton columns={6} rows={5} />
          </div>
          <CardListSkeleton rows={4} />
        </div>
        <CardListSkeleton rows={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
            Overview
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Company-wide project health and resource allocation
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="gap-1.5 font-semibold self-start sm:self-auto"
        >
          <Icon icon={Plus} size={15} />
          <span>New project</span>
        </Button>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ADMIN_METRICS.map((metric) => (
          <KpiCard key={metric.id} data={metric} />
        ))}
      </div>

      {/* Middle 2-Column Section: Fixed 390px with inner scrolling */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left Card: All active projects table */}
        <Card className="lg:col-span-2 p-5 border-border-subtle bg-canvas-surface flex flex-col h-[390px] min-h-[390px] max-h-[390px] overflow-hidden">
          <div className="flex items-center justify-between pb-3 shrink-0">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                All active projects
              </h2>
              <p className="text-2xs text-muted-foreground">
                Monitored progress, resource loads, and milestones
              </p>
            </div>
            <span className="rounded-full bg-muted px-2 py-0.5 text-3xs font-bold text-muted-foreground">
              {projectRows.length} showing
            </span>
          </div>

          {/* Internal Scrollable Table Container */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto rounded-md border border-border-subtle">
            <Table className="relative">
              <TableHeader className="sticky top-0 bg-canvas-surface z-10 shadow-xs">
                <TableRow>
                  <TableHead className="bg-canvas-surface">Project</TableHead>
                  <TableHead className="bg-canvas-surface">Client</TableHead>
                  <TableHead className="bg-canvas-surface">Manager</TableHead>
                  <TableHead className="bg-canvas-surface">Status</TableHead>
                  <TableHead className="text-right bg-canvas-surface">
                    Hours logged
                  </TableHead>
                  <TableHead className="w-[120px] text-right bg-canvas-surface">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground leading-none">
                          {row.name}
                        </p>
                        <p className="text-2xs text-muted-foreground leading-none">
                          {row.subname}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {row.client}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {row.manager}
                    </TableCell>
                    <TableCell>
                      <StatusIndicator status={row.status} />
                    </TableCell>
                    <TableCell className="text-right text-xs tabular-nums font-medium">
                      {row.hoursLogged.toFixed(1)}h
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingRow(row)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:text-teal-600 dark:hover:text-teal-400"
                        >
                          <Icon icon={Pencil} size={13} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              MOCK_PROJECTS.some((p) => p.name === row.name)
                                ? `/projects/${MOCK_PROJECTS.find((p) => p.name === row.name)!.id}`
                                : "/projects",
                            )
                          }
                          className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                        >
                          View
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="pt-2 flex items-center justify-between text-2xs text-muted-foreground shrink-0">
            <span>Showing {projectRows.length} of 14 projects</span>
            <div className="flex gap-2">
              <button type="button" className="hover:text-foreground">
                Previous
              </button>
              <span>•</span>
              <button type="button" className="hover:text-foreground">
                Next
              </button>
            </div>
          </div>
        </Card>

        {/* Right Card: Team Distribution */}
        <Card className="p-5 border-border-subtle bg-canvas-surface flex flex-col h-[390px] min-h-[390px] max-h-[390px] overflow-hidden justify-between">
          <div className="pb-3 border-b border-border-subtle shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Team distribution
              </h3>
              <Icon icon={Users} size={15} className="text-muted-foreground" />
            </div>
            <p className="text-2xs text-muted-foreground mt-0.5">
              Resource allocation across active units
            </p>
          </div>

          {/* Internal Scrollable Breakdown */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-border-subtle py-1 pr-1">
            {ADMIN_TEAM_DISTRIBUTION.map((team, idx) => (
              <div
                key={idx}
                className="py-2.5 first:pt-0 last:pb-0 space-y-0.5"
              >
                <p className="text-xs font-semibold text-foreground">
                  {team.department}
                </p>
                <p className="text-2xs text-muted-foreground">{team.details}</p>
              </div>
            ))}
          </div>

          {/* Static Bottom Capacity Box & Link */}
          <div className="pt-2 border-t border-border-subtle space-y-2 shrink-0">
            <div className="rounded-lg border border-border-subtle bg-canvas-bg/50 p-2.5 flex items-start gap-2">
              <Icon
                icon={CheckCircle2}
                size={14}
                className="text-teal-500 mt-0.5"
              />
              <div className="space-y-0.5 text-xs">
                <p className="font-semibold text-foreground text-2xs">
                  Target capacity nominal
                </p>
                <p className="text-muted-foreground text-3xs leading-tight">
                  Overall 84% capacity is allocated across units.
                </p>
              </div>
            </div>

            <Link
              to="/teams"
              className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline block"
            >
              Manage user directory →
            </Link>
          </div>
        </Card>
      </div>

      {/* Bottom scheduled activities */}
      <UpcomingActivities />

      {editingRow && (
        <ProjectSettingsDialog
          key={editingRow.id}
          project={projectForRow(editingRow)}
          open
          onOpenChange={(open) => !open && setEditingRow(null)}
          onUpdateProject={(updated) =>
            setProjectRows((prev) =>
              prev.map((r) =>
                r.id === editingRow.id
                  ? {
                      ...r,
                      name: updated.name,
                      client: updated.client,
                      subname: updated.description || r.subname,
                      status: ROW_STATUS[updated.status],
                    }
                  : r,
              ),
            )
          }
        />
      )}

      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}
