import * as React from "react";
import { ChevronRight, CalendarDays, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { KpiCard, StatusIndicator } from "@/components/composed";
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
import { useAuth } from "@/app/providers";
import { useSimulatedLoading } from "@/lib/use-simulated-loading";
import {
  PageHeaderSkeleton,
  MetricCardGridSkeleton,
  CardListSkeleton,
  TableSkeleton,
} from "@/components/composed/skeletons";
import { MOCK_PROJECTS } from "@/features/projects/api/mock-data";
import { BurndownChart } from "@/components/composed/burndown-chart";
import {
  BASE_DAILY_DELTAS,
  BASE_SPRINT_CAPACITY_HOURS,
  CURRENT_SPRINT_LABEL,
  SPRINT_TODAY_DAY,
  SPRINT_TOTAL_DAYS,
} from "../api/burndown-mock";

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
  // The user's own contribution per project (not the project-wide totals).
  const myHoursByProject = new Map(
    assignedProjects.map((p) => [
      p.id,
      p.members.find((m) => m.email === user?.email)?.hoursLogged ?? 0,
    ]),
  );
  const totalHoursLogged = assignedProjects.reduce(
    (s, p) => s + (myHoursByProject.get(p.id) ?? 0),
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
  // Personal capacity: each project's estimate weighted by the user's share
  // of the effort logged on it so far.
  const sprintCapacityHours = assignedProjects.reduce(
    (s, p) =>
      s +
      (p.loggedHours > 0
        ? p.estimatedHours * ((myHoursByProject.get(p.id) ?? 0) / p.loggedHours)
        : 0),
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
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
        <KpiCard
          label="My active projects"
          value={activeProjects}
          subtext="Assigned portfolio"
          sparklineData={[
            Math.max(0, activeProjects - 2),
            Math.max(0, activeProjects - 1),
            activeProjects,
          ]}
        />

        <KpiCard
          label="My avg. completion"
          value={`${avgCompletion}%`}
          trend={{
            value: "+3.2%",
            direction: "up",
            timeframe: "vs last sprint",
          }}
          sparklineData={[58, 62, 65, avgCompletion]}
          strokeColor="text-teal-500 dark:text-teal-400 stroke-teal-500 dark:stroke-teal-400"
        />

        <KpiCard
          label="My hours logged"
          value={`${totalHoursLogged.toFixed(1)}h`}
          trend={{ value: "+8.5h", direction: "up", timeframe: "this cycle" }}
          sparklineData={[
            Math.round(totalHoursLogged * 0.35),
            Math.round(totalHoursLogged * 0.6),
            Math.round(totalHoursLogged * 0.85),
            totalHoursLogged,
          ]}
          strokeColor="text-teal-500 dark:text-teal-400 stroke-teal-500 dark:stroke-teal-400"
        />

        <KpiCard
          label="Needs my attention"
          value={overBudget}
          isPositiveGood={false}
          subtext={overBudget > 0 ? "over logged hours" : "all on budget"}
          badge={
            overBudget > 0
              ? { text: "Alert", variant: "destructive" }
              : undefined
          }
          alertLink={
            overBudget > 0
              ? { to: "#my-projects", label: "View projects" }
              : undefined
          }
          sparklineData={overBudget > 0 ? [0, 1, overBudget] : [0, 0, 0, 0]}
          strokeColor={
            overBudget > 0
              ? "text-rose-500 dark:text-rose-400 stroke-rose-500 dark:stroke-rose-400"
              : undefined
          }
        />
      </div>

      {/* My projects table */}
      <Card
        id="my-projects"
        tabIndex={-1}
        className="p-5 shadow-xs border-border-subtle bg-canvas-surface overflow-x-auto"
      >
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
                  <StatusIndicator status={project.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-8 tabular-nums shrink-0">
                      {project.completionPercentage}%
                    </span>
                    <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden shrink-0">
                      <div
                        className="h-full rounded-full bg-teal-500 transition-all"
                        style={{ width: `${project.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
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
    </div>
  );
}
