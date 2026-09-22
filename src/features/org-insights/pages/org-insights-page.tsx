import * as React from "react";
import { CalendarDays } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useSimulatedLoading } from "@/lib/use-simulated-loading";
import {
  PageHeaderSkeleton,
  MetricCardGridSkeleton,
  CardListSkeleton,
  TableSkeleton,
} from "@/components/composed/skeletons";
import { BurndownChart } from "@/components/composed/burndown-chart";
import {
  BASE_DAILY_DELTAS,
  BASE_SPRINT_CAPACITY_HOURS,
  CURRENT_SPRINT_LABEL,
  SPRINT_TODAY_DAY,
  SPRINT_TOTAL_DAYS,
} from "../api/burndown-mock";

type ProjectHealth = "On track" | "At risk" | "Delayed" | "Completed";

interface ProjectPerf {
  id: string;
  shortLabel: string;
  name: string;
  health: ProjectHealth;
  progress: number;
  estimated: number;
  actual: number;
  bottleneck: string;
}

const PROJECTS: ProjectPerf[] = [
  {
    id: "p-1",
    shortLabel: "Apex",
    name: "Apex Analytics",
    health: "On track",
    progress: 82,
    estimated: 186,
    actual: 184.5,
    bottleneck: "Pipeline real-time sync",
  },
  {
    id: "p-2",
    shortLabel: "Nova",
    name: "Nova Mobile Dev",
    health: "On track",
    progress: 46,
    estimated: 140,
    actual: 135.0,
    bottleneck: "Biometric auth screens",
  },
  {
    id: "p-3",
    shortLabel: "Cloud",
    name: "Cloud Migration Phase 2",
    health: "On track",
    progress: 91,
    estimated: 260,
    actual: 258.0,
    bottleneck: "Database failover testing",
  },
  {
    id: "p-4",
    shortLabel: "Supply",
    name: "SupplySync Portal",
    health: "At risk",
    progress: 35,
    estimated: 90,
    actual: 104.5,
    bottleneck: "Vendor webhook ingest",
  },
  {
    id: "p-5",
    shortLabel: "Bio",
    name: "Biometric Access",
    health: "Delayed",
    progress: 18,
    estimated: 110,
    actual: 132.5,
    bottleneck: "Firmware bridge driver",
  },
  {
    id: "p-6",
    shortLabel: "Legacy",
    name: "Legacy Data Warehousing",
    health: "Completed",
    progress: 100,
    estimated: 75,
    actual: 72.0,
    bottleneck: "Final archive migration",
  },
];

const HEALTH_BAR_CLASSES: Record<ProjectHealth, string> = {
  "On track": "bg-teal-500",
  "At risk": "bg-amber-500",
  Delayed: "bg-rose-500",
  Completed: "bg-navy-500 dark:bg-foreground/70",
};

interface EstimatedVsActualChartProps {
  projects: ProjectPerf[];
}

function EstimatedVsActualChart({ projects }: EstimatedVsActualChartProps) {
  const width = 560;
  const height = 200;
  const padL = 8;
  const padR = 8;
  const padT = 10;
  const padB = 24;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const maxHours = Math.max(
    ...projects.map((p) => Math.max(p.estimated, p.actual)),
  );
  const groupW = plotW / projects.length;
  const barW = groupW * 0.28;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {[0, 0.5, 1].map((frac) => (
        <line
          key={frac}
          x1={padL}
          x2={width - padR}
          y1={padT + plotH * (1 - frac)}
          y2={padT + plotH * (1 - frac)}
          stroke="currentColor"
          strokeOpacity={0.08}
        />
      ))}

      {projects.map((project, i) => {
        const groupX = padL + i * groupW + groupW / 2;
        const estH = (project.estimated / maxHours) * plotH;
        const actH = (project.actual / maxHours) * plotH;
        return (
          <g key={project.id}>
            <rect
              x={groupX - barW - 2}
              y={padT + plotH - estH}
              width={barW}
              height={estH}
              rx={2}
              className="fill-navy-500 dark:fill-foreground/70"
            />
            <rect
              x={groupX + 2}
              y={padT + plotH - actH}
              width={barW}
              height={actH}
              rx={2}
              className="fill-teal-500"
            />
            <text
              x={groupX}
              y={height - 6}
              textAnchor="middle"
              fontSize={10}
              fill="currentColor"
              opacity={0.7}
            >
              {project.shortLabel}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function OrgInsightsPage() {
  const isLoading = useSimulatedLoading();
  const [period, setPeriod] = React.useState("30d");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <MetricCardGridSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <CardListSkeleton rows={4} />
          <CardListSkeleton rows={4} />
        </div>
        <TableSkeleton columns={6} rows={6} />
      </div>
    );
  }

  const activeProjects = PROJECTS.length;
  const avgCompletion = 68.4;
  const totalHoursLogged = PROJECTS.reduce((s, p) => s + p.actual, 0);
  const atRisk = PROJECTS.filter((p) => p.health === "At risk").length;
  const delayed = PROJECTS.filter((p) => p.health === "Delayed").length;
  const needsAttention = atRisk + delayed;

  // Portfolio-wide burndown — same chart type as a project's Reports tab,
  // scaled to the portfolio's total estimated hours instead of one project's.
  const portfolioCapacityHours = PROJECTS.reduce((s, p) => s + p.estimated, 0);
  const portfolioScale = portfolioCapacityHours / BASE_SPRINT_CAPACITY_HOURS;
  const portfolioDailyDeltas = BASE_DAILY_DELTAS.map(
    (d) => Math.round(d * portfolioScale * 10) / 10,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1"></div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            Organizational performance
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
          label="Active projects"
          value={activeProjects}
          trend={{
            value: "+1",
            direction: "up",
            timeframe: "vs last cycle",
          }}
          sparklineData={[5, 5, 6, 6, 6, 6]}
        />

        <KpiCard
          label="Avg. completion"
          value={`${avgCompletion}%`}
          trend={{
            value: "+4.1%",
            direction: "up",
            timeframe: "vs last cycle",
          }}
          sparklineData={[58, 61, 63, 65, 67, 68.4]}
        />

        <KpiCard
          label="Total hours logged"
          value={`${totalHoursLogged.toFixed(1)}h`}
          trend={{
            value: "+12.4%",
            direction: "up",
            timeframe: "vs previous 30d",
          }}
          sparklineData={[720, 755, 790, 830, 860, 886.5]}
        />

        <KpiCard
          label="Needs attention"
          value={`${needsAttention} `}
          badge={
            needsAttention > 0
              ? { text: "Alert", variant: "destructive" }
              : undefined
          }

          isPositiveGood={false}
          sparklineData={[0, 1, 0, 1, 1, needsAttention]}
          strokeColor="stroke-rose-500"
          alertLink={
            needsAttention > 0
              ? {
                  to: "#project-performance",
                  label: "View at-risk projects",
                }
              : undefined
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5 shadow-xs border-border-subtle bg-canvas-surface">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground">
              Estimated vs. actual hours
            </h3>
            <span className="text-3xs font-semibold text-muted-foreground">
              HRS
            </span>
          </div>
          <EstimatedVsActualChart projects={PROJECTS} />
          <div className="mt-3 flex items-center gap-4 text-2xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-navy-500 dark:bg-foreground/70" />
              Estimated
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-teal-500" />
              Actual
            </span>
          </div>
        </Card>

        <Card className="p-5 shadow-xs border-border-subtle bg-canvas-surface">
          <h3 className="text-sm font-bold text-foreground">
            {CURRENT_SPRINT_LABEL}: Active Effort &amp; Burndown Trajectory
          </h3>
          <p className="text-2xs text-muted-foreground mt-0.5 mb-3">
            Ideal line vs actual remaining effort across a {SPRINT_TOTAL_DAYS}
            -day sprint window, portfolio-wide
          </p>
          <BurndownChart
            totalHours={portfolioCapacityHours}
            dailyDeltas={portfolioDailyDeltas}
            totalDays={SPRINT_TOTAL_DAYS}
            todayDay={SPRINT_TODAY_DAY}
          />
        </Card>
      </div>

      {/* Project performance table */}
      <Card
        id="project-performance"
        tabIndex={-1}
        className="p-5 shadow-xs border-border-subtle bg-canvas-surface overflow-x-auto"
      >
        <h3 className="text-sm font-bold text-foreground mb-3">
          Project performance
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Health</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Est. vs actual</TableHead>
              <TableHead>Variance</TableHead>
              <TableHead>Top bottleneck</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PROJECTS.map((project) => {
              const variance =
                Math.round(
                  ((project.actual - project.estimated) / project.estimated) *
                    100 *
                    10,
                ) / 10;
              return (
                <TableRow key={project.id}>
                  <TableCell className="text-xs font-semibold text-foreground whitespace-nowrap">
                    {project.name}
                  </TableCell>
                  <TableCell>
                    <StatusIndicator status={project.health} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 w-32">
                      <span className="text-xs text-muted-foreground w-9 shrink-0">
                        {project.progress}%
                      </span>
                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            HEALTH_BAR_CLASSES[project.health],
                          )}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                    {project.estimated}h / {project.actual.toFixed(1)}h
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-xs font-semibold",
                      variance > 0
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-teal-600 dark:text-teal-400",
                    )}
                  >
                    {variance > 0 ? "+" : ""}
                    {variance}%
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {project.bottleneck}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
