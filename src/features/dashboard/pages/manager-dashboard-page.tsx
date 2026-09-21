import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, ArrowRight } from "lucide-react";
import { useModalHotkey } from "@/hooks/use-hotkey";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MANAGER_METRICS,
  MANAGER_TASKS_TABLE,
  MANAGER_PROJECTS_LIST,
} from "../api/mock-data";
import { MetricCard } from "../components/metric-card";
import { UpcomingActivities } from "../components/upcoming-activities";
import { LogTimeDialog } from "../components/log-time-dialog";
import { useSimulatedLoading } from "@/lib/use-simulated-loading";
import {
  PageHeaderSkeleton,
  MetricCardGridSkeleton,
  TableSkeleton,
  CardListSkeleton,
} from "@/components/composed/skeletons";

export function ManagerDashboardPage() {
  const navigate = useNavigate();
  const isLoading = useSimulatedLoading();
  const [logTimeOpen, setLogTimeOpen] = React.useState(false);

  useModalHotkey({
    open: logTimeOpen,
    onOpen: () => setLogTimeOpen(true),
    onClose: () => setLogTimeOpen(false),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <MetricCardGridSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <TableSkeleton columns={5} rows={5} />
          </div>
          <CardListSkeleton rows={3} />
        </div>
        <CardListSkeleton rows={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header with + Log time button */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
            Project management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Supervising 2 assigned projects and 12 team members
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="accent"
            size="sm"
            onClick={() => setLogTimeOpen(true)}
            className="gap-1.5 font-semibold text-xs h-8"
          >
            <Icon icon={Plus} size={15} />
            <span>Log time</span>
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MANAGER_METRICS.map((metric) => (
          <MetricCard key={metric.id} data={metric} />
        ))}
      </div>

      {/* Middle 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left Card: Active tasks table */}
        <Card
          id="manager-tasks"
          tabIndex={-1}
          className="lg:col-span-2 p-5 border-border-subtle bg-canvas-surface flex flex-col h-[390px] min-h-[390px] max-h-[390px] overflow-hidden"
        >
          <div className="flex items-center justify-between pb-3 shrink-0">
            <h2 className="text-sm font-semibold text-foreground">
              Active &amp; assigned tasks
            </h2>
            <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-3xs font-bold text-teal-600 dark:text-teal-400">
              {MANAGER_TASKS_TABLE.length} total in progress
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto rounded-md border border-border-subtle">
            <Table className="relative">
              <TableHeader className="sticky top-0 bg-canvas-surface z-10 shadow-xs">
                <TableRow>
                  <TableHead className="bg-canvas-surface">Task name</TableHead>
                  <TableHead className="bg-canvas-surface">Project</TableHead>
                  <TableHead className="bg-canvas-surface">Assignee</TableHead>
                  <TableHead className="bg-canvas-surface">Due date</TableHead>
                  <TableHead className="w-[60px] text-right bg-canvas-surface">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MANAGER_TASKS_TABLE.map((task) => {
                  const targetProjectId = task.project
                    .toLowerCase()
                    .includes("nova")
                    ? "proj-2"
                    : "proj-1";

                  return (
                    <TableRow
                      key={task.id}
                      onClick={() => navigate(`/projects/${targetProjectId}`)}
                      className="cursor-pointer hover:bg-canvas-overlay/60 transition-colors"
                    >
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-foreground leading-none">
                            {task.name}
                          </p>
                          <p className="text-2xs text-muted-foreground leading-none">
                            {task.subtext}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {task.project}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-4xs bg-navy-500 text-white font-bold">
                              {task.assignee.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-foreground font-medium">
                            {task.assignee.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {task.dueDate}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          to={`/projects/${targetProjectId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                        >
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Right Card: My projects */}
        <Card className="p-5 border-border-subtle bg-canvas-surface flex flex-col h-[390px] min-h-[390px] max-h-[390px] overflow-hidden justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle shrink-0">
            <h3 className="text-sm font-semibold text-foreground">
              My projects
            </h3>
            <span className="text-xs text-muted-foreground font-medium">
              {MANAGER_PROJECTS_LIST.length} tracking targets
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-3 py-2 pr-1">
            {MANAGER_PROJECTS_LIST.map((proj) => (
              <div
                key={proj.id}
                className="rounded-lg border border-border-subtle bg-canvas-bg/50 p-3.5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {proj.name}
                    </p>
                    <p className="text-2xs text-muted-foreground">
                      {proj.subtext}
                    </p>
                  </div>
                  <Badge variant="success" className="text-4xs px-1.5 py-0">
                    {proj.status}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-2xs font-medium">
                    <span>Progress: {proj.progress}%</span>
                    <span className="text-muted-foreground tabular-nums">
                      {proj.loggedHours}h logged
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center -space-x-1.5 overflow-hidden">
                    {proj.members.map((m: any, i: number) => {
                      const initial =
                        typeof m === "string" ? m : (m?.initials ?? "");
                      const name =
                        typeof m === "string" ? m : (m?.name ?? initial);
                      return (
                        <div
                          key={i}
                          title={name}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-500 text-4xs font-bold text-white ring-1 ring-canvas-surface"
                        >
                          {initial}
                        </div>
                      );
                    })}
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-4xs font-bold text-muted-foreground ring-1 ring-canvas-surface">
                      +{proj.moreMembers}
                    </div>
                  </div>

                  <Link
                    to={`/projects/${proj.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline transition-colors"
                  >
                    <span>Open workspace</span>
                    <Icon icon={ArrowRight} size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <UpcomingActivities />
      <LogTimeDialog open={logTimeOpen} onOpenChange={setLogTimeOpen} />
    </div>
  );
}
