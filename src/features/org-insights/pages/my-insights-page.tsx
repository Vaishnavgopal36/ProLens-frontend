import * as React from "react";
import { ChevronRight, CalendarDays, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/providers";
import { useSimulatedLoading } from "@/lib/use-simulated-loading";
import {
  PageHeaderSkeleton,
  MetricCardGridSkeleton,
  CardListSkeleton,
  TableSkeleton,
} from "@/components/composed/skeletons";
import { MOCK_PROJECTS } from "@/features/projects/api/mock-data";
import type { ProjectStatus } from "@/types/project";
import { BurndownChart } from "@/components/composed/burndown-chart";
import {
  BASE_DAILY_DELTAS,
  BASE_SPRINT_CAPACITY_HOURS,
  CURRENT_SPRINT_LABEL,
  SPRINT_TODAY_DAY,
  SPRINT_TOTAL_DAYS,
} from "../api/burndown-mock";

const STATUS_BADGE_CLASSES: Record<ProjectStatus, string> = {
  ongoing:
    "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800",
  pending:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  completed: "bg-canvas-bg text-muted-foreground border-border-subtle",
};

export function MyInsightsPage() {
  const { user } = useAuth();
  const isLoading = useSimulatedLoading();
  const [period, setPeriod] = React.useState("30d");

  const assignedProjects = React.useMemo(
    () =>
      MOCK_PROJECTS.filter((project) =>
        project.members.some((member) => member.email === user?.email),
      ),
    [user?.email],
  );

  const activeProjects = assignedProjects.filter(
    (p) => p.status === "ongoing",
  ).length;
  const avgCompletion = assignedProjects.length
    ? Math.round(
        (assignedProjects.reduce((s, p) => s + p.completionPercentage, 0) /
          assignedProjects.length) *
          10,
      ) / 10
    : 0;
  const totalHoursLogged = assignedProjects.reduce(
    (s, p) => s + p.loggedHours,
    0,
  );
  const overBudget = assignedProjects.filter(
    (p) => p.loggedHours > p.estimatedHours,
  ).length;

  // Scale the mock daily-effort shape against real assigned capacity so the
  // chart stays proportional to however many projects the user is staffed
  // on. With zero assigned projects there's no effort to burn down at all —
  // that renders an empty state instead of a fabricated chart.
  const hasAssignments = assignedProjects.length > 0;
  const sprintCapacityHours = assignedProjects.reduce(
    (s, p) => s + p.estimatedHours,
    0,
  );
  const scale = sprintCapacityHours / BASE_SPRINT_CAPACITY_HOURS;
  const dailyDeltas = BASE_DAILY_DELTAS.map(
    (d) => Math.round(d * scale * 10) / 10,
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <MetricCardGridSkeleton count={4} />
        <CardListSkeleton rows={5} />
        <TableSkeleton columns={5} rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
            <span>Insights</span>
            <Icon icon={ChevronRight} size={12} className="opacity-50" />
            <span className="text-foreground font-semibold">
              My Performance
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My performance
          </h1>
        </div>

        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="h-9 w-auto gap-1.5 text-xs font-semibold bg-canvas-surface border-border-subtle px-3">
            <Icon
              icon={CalendarDays}
              size={13}
              className="text-muted-foreground"
            />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 shadow-xs border-border-subtle bg-canvas-surface">
          <p className="text-xs font-medium text-muted-foreground">
            My active projects
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {activeProjects}
          </p>
        </Card>

        <Card className="p-4 shadow-xs border-border-subtle bg-canvas-surface">
          <p className="text-xs font-medium text-muted-foreground">
            My avg. completion
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {avgCompletion}%
            </span>
          </div>
        </Card>

        <Card className="p-4 shadow-xs border-border-subtle bg-canvas-surface">
          <p className="text-xs font-medium text-muted-foreground">
            My hours logged
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {totalHoursLogged.toFixed(1)}h
          </p>
        </Card>

        <Card
          className={cn(
            "p-4 shadow-xs",
            overBudget > 0 &&
              "border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10",
          )}
        >
          <p
            className={cn(
              "text-xs font-medium",
              overBudget > 0
                ? "text-amber-700 dark:text-amber-400"
                : "text-muted-foreground",
            )}
          >
            Needs my attention
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {overBudget}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {overBudget > 0 ? "over logged hours" : "all on budget"}
          </p>
        </Card>
      </div>

      {/* Sprint burndown */}
      <Card className="p-5 shadow-xs border-border-subtle bg-canvas-surface max-w-2xl">
        {hasAssignments ? (
          <>
            <h4 className="font-bold text-sm text-foreground">
              {CURRENT_SPRINT_LABEL}: Active Effort &amp; Burndown Trajectory
            </h4>
            <p className="text-2xs text-muted-foreground mt-0.5 mb-3">
              Ideal line vs actual remaining effort across a {SPRINT_TOTAL_DAYS}
              -day sprint window
            </p>
            <BurndownChart
              totalHours={sprintCapacityHours}
              dailyDeltas={dailyDeltas}
              totalDays={SPRINT_TOTAL_DAYS}
              todayDay={SPRINT_TODAY_DAY}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <Icon
              icon={TrendingUp}
              size={20}
              className="text-muted-foreground/50"
            />
            <p className="text-sm font-semibold text-foreground">
              No sprint activity yet
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              You aren't assigned to any projects, so there's no effort to
              track. Your burndown will appear here once you're staffed on one.
            </p>
          </div>
        )}
      </Card>

      {/* My projects table */}
      <Card className="p-5 shadow-xs border-border-subtle bg-canvas-surface overflow-x-auto">
        <h3 className="text-sm font-bold text-foreground mb-3">My projects</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Est. vs logged</TableHead>
              <TableHead>Due date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignedProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="text-xs font-semibold text-foreground whitespace-nowrap">
                  {project.name}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-3xs uppercase font-bold",
                      STATUS_BADGE_CLASSES[project.status],
                    )}
                  >
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 w-32">
                    <span className="text-xs text-muted-foreground w-9 shrink-0">
                      {project.completionPercentage}%
                    </span>
                    <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-teal-500"
                        style={{ width: `${project.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                  {project.estimatedHours}h / {project.loggedHours.toFixed(1)}h
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {project.dueDate}
                </TableCell>
              </TableRow>
            ))}
            {assignedProjects.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-xs text-muted-foreground py-8"
                >
                  You aren't assigned to any projects yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
