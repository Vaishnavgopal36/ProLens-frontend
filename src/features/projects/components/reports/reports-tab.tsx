import * as React from "react";
import { Download, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

interface WorkstreamReport {
  id: string;
  name: string;
  code: string;
  dotClass: string;
  barClass: string;
  plannedHours: number;
  loggedHours: number;
  plannedPoints: number;
  deliveredPoints: number;
  commits: number;
  bugs: number;
  status: "On Track" | "Attention" | "In Progress";
}

const WORKSTREAMS: WorkstreamReport[] = [
  {
    id: "ws-1",
    name: "Design System",
    code: "PROL-12 Prototyping & Tokens",
    dotClass: "bg-teal-500",
    barClass: "bg-teal-500",
    plannedHours: 40,
    loggedHours: 34.5,
    plannedPoints: 12,
    deliveredPoints: 10,
    commits: 28,
    bugs: 0,
    status: "On Track",
  },
  {
    id: "ws-2",
    name: "Authentication",
    code: "PROL-15 API Auth & Middleware",
    dotClass: "bg-navy-500 dark:bg-foreground",
    barClass: "bg-navy-500 dark:bg-foreground",
    plannedHours: 45,
    loggedHours: 42,
    plannedPoints: 14,
    deliveredPoints: 13,
    commits: 34,
    bugs: 1,
    status: "On Track",
  },
  {
    id: "ws-3",
    name: "Reporting",
    code: "PROL-21 Schema & Ingestion",
    dotClass: "bg-amber-500",
    barClass: "bg-amber-500",
    plannedHours: 46.5,
    loggedHours: 54,
    plannedPoints: 14,
    deliveredPoints: 11,
    commits: 41,
    bugs: 1,
    status: "Attention",
  },
  {
    id: "ws-4",
    name: "QA & Hardening",
    code: "PROL-24 Telemetry Handover",
    dotClass: "bg-slate-400",
    barClass: "bg-slate-400",
    plannedHours: 38.5,
    loggedHours: 33,
    plannedPoints: 8,
    deliveredPoints: 8,
    commits: 19,
    bugs: 0,
    status: "In Progress",
  },
];

const STATUS_BADGE_CLASSES: Record<WorkstreamReport["status"], string> = {
  "On Track":
    "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800",
  Attention:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  "In Progress":
    "bg-canvas-bg text-muted-foreground border-border-subtle",
};

// Burndown series derived from the project's own estimated/logged hours so
// this stays consistent with the KPI bar instead of duplicating fake totals.
const SPRINT_TOTAL_DAYS = 15;
const TODAY_DAY = 10;
const DAILY_DELTAS = [10, 14, 18, 20, 16, 22, 15, 19, 17, 12]; // sums to project.loggedHours

function buildBurndown(totalHours: number) {
  const remaining: number[] = [totalHours];
  let cumulative = 0;
  for (const delta of DAILY_DELTAS) {
    cumulative += delta;
    remaining.push(totalHours - cumulative);
  }
  const idealPerDay = totalHours / SPRINT_TOTAL_DAYS;
  const ideal = Array.from({ length: SPRINT_TOTAL_DAYS + 1 }, (_, day) =>
    Math.max(0, totalHours - idealPerDay * day),
  );
  return { remaining, ideal, idealPerDay };
}

function BurndownChart({ project }: { project: Project }) {
  const { remaining, ideal, idealPerDay } = React.useMemo(
    () => buildBurndown(project.estimatedHours),
    [project.estimatedHours],
  );

  const width = 640;
  const height = 220;
  const padL = 36;
  const padR = 12;
  const padT = 16;
  const padB = 24;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const xFor = (day: number) => padL + (day / SPRINT_TOTAL_DAYS) * plotW;
  const yFor = (hours: number) =>
    padT + plotH - (hours / project.estimatedHours) * plotH;

  const idealPoints = ideal
    .map((h, day) => `${xFor(day)},${yFor(h)}`)
    .join(" ");
  const actualPoints = remaining
    .map((h, day) => `${xFor(day)},${yFor(h)}`)
    .join(" ");

  const todayRemaining = remaining[remaining.length - 1];
  const avgBurnRate = (project.estimatedHours - todayRemaining) / TODAY_DAY;
  const projectedDaysLeft = todayRemaining / Math.max(0.1, avgBurnRate);
  const projectedEndDay = TODAY_DAY + projectedDaysLeft;
  const slipDays = Math.round(projectedEndDay - SPRINT_TOTAL_DAYS);

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Horizontal gridlines + y labels */}
        {gridLines.map((frac) => {
          const y = padT + plotH * (1 - frac);
          const hours = Math.round(project.estimatedHours * frac);
          return (
            <g key={frac}>
              <line
                x1={padL}
                x2={width - padR}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.08}
              />
              <text x={4} y={y + 3} fontSize={9} fill="currentColor" opacity={0.6}>
                {hours}h
              </text>
            </g>
          );
        })}

        {/* Daily logged bars */}
        {DAILY_DELTAS.map((delta, i) => {
          const day = i + 1;
          const barH = (delta / project.estimatedHours) * plotH * 0.9;
          const x = xFor(day) - 8;
          return (
            <rect
              key={day}
              x={x}
              y={padT + plotH - barH}
              width={16}
              height={barH}
              className="fill-teal-500/15"
              rx={2}
            />
          );
        })}

        {/* Ideal burn (dashed) */}
        <polyline
          points={idealPoints}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.4}
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />

        {/* Actual remaining (solid) */}
        <polyline
          points={actualPoints}
          fill="none"
          className="stroke-teal-600 dark:stroke-teal-400"
          strokeWidth={2.25}
        />

        {/* Today marker */}
        <line
          x1={xFor(TODAY_DAY)}
          x2={xFor(TODAY_DAY)}
          y1={padT}
          y2={padT + plotH}
          className="stroke-teal-500"
          strokeDasharray="2 2"
          strokeOpacity={0.5}
        />
        <circle
          cx={xFor(TODAY_DAY)}
          cy={yFor(todayRemaining)}
          r={3.5}
          className="fill-teal-600 dark:fill-teal-400"
        />
        <text
          x={xFor(TODAY_DAY) + 6}
          y={yFor(todayRemaining) - 6}
          fontSize={10}
          fontWeight={600}
          className="fill-foreground"
        >
          Today (Day {TODAY_DAY}): {todayRemaining.toFixed(1)}h left
        </text>

        {/* X axis day labels */}
        {[0, TODAY_DAY, SPRINT_TOTAL_DAYS].map((day) => (
          <text
            key={day}
            x={xFor(day)}
            y={height - 6}
            fontSize={9}
            textAnchor={day === 0 ? "start" : day === SPRINT_TOTAL_DAYS ? "end" : "middle"}
            fill="currentColor"
            opacity={0.6}
          >
            {day === 0 ? "Start" : day === SPRINT_TOTAL_DAYS ? "End" : `D${day}`}
          </text>
        ))}
      </svg>

      <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full bg-foreground/40" style={{ borderTop: "1.5px dashed currentColor" }} />
          Ideal burn
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full bg-teal-500" />
          Actual remaining
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
        <div className="rounded-lg border border-border-subtle p-2.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
            Planned burn
          </p>
          <p className="font-bold text-foreground">{idealPerDay.toFixed(1)}h/day</p>
        </div>
        <div className="rounded-lg border border-border-subtle p-2.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
            Actual burn
          </p>
          <p className="font-bold text-foreground">{avgBurnRate.toFixed(1)}h/day</p>
        </div>
        <div className="rounded-lg border border-border-subtle p-2.5">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
            Projected slip
          </p>
          <p
            className={cn(
              "font-bold",
              slipDays <= 0
                ? "text-teal-600 dark:text-teal-400"
                : "text-amber-600 dark:text-amber-400",
            )}
          >
            {slipDays <= 0 ? "On schedule" : `+${slipDays}d`}
          </p>
        </div>
      </div>
    </div>
  );
}

interface ReportsTabProps {
  project: Project;
  selectedMemberId?: string | null;
}

export function ReportsTab({
  project,
  selectedMemberId: _selectedMemberId,
}: ReportsTabProps) {
  const totalPlanned = WORKSTREAMS.reduce((s, w) => s + w.plannedHours, 0);
  const totalLogged = WORKSTREAMS.reduce((s, w) => s + w.loggedHours, 0);
  const totalPlannedPts = WORKSTREAMS.reduce((s, w) => s + w.plannedPoints, 0);
  const totalDeliveredPts = WORKSTREAMS.reduce((s, w) => s + w.deliveredPoints, 0);
  const totalCommits = WORKSTREAMS.reduce((s, w) => s + w.commits, 0);
  const totalBugs = WORKSTREAMS.reduce((s, w) => s + w.bugs, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Burndown */}
        <Card className="border-border-subtle bg-canvas-surface p-5 shadow-xs">
          <h4 className="font-bold text-sm text-foreground">
            {project.activeSprint || "Sprint"} Effort &amp; Burndown Trajectory
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5 mb-3">
            Ideal line vs actual remaining effort across a {SPRINT_TOTAL_DAYS}-day sprint window
          </p>
          <BurndownChart project={project} />
        </Card>

        {/* Effort allocation */}
        <Card className="border-border-subtle bg-canvas-surface p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-foreground">
              Effort Allocation by Feature Stream
            </h4>
            <span className="text-[11px] text-muted-foreground">
              {WORKSTREAMS.length} streams
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 mb-3">
            {totalLogged.toFixed(1)} logged hours across active workstreams
          </p>

          <div className="space-y-4">
            {WORKSTREAMS.map((ws) => {
              const percent = Math.min(
                100,
                Math.round((ws.loggedHours / totalLogged) * 100),
              );
              const variancePercent = Math.round(
                ((ws.loggedHours - ws.plannedHours) / ws.plannedHours) * 100,
              );
              return (
                <div key={ws.id}>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn("h-2 w-2 rounded-full shrink-0", ws.dotClass)} />
                      <span className="font-semibold text-foreground truncate">
                        {ws.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-semibold text-foreground">
                        {ws.loggedHours.toFixed(1)}h ({percent}%)
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] px-1.5 py-0 font-bold",
                          variancePercent > 5
                            ? "border-amber-500/40 text-amber-600 bg-amber-500/10 dark:text-amber-400"
                            : "border-teal-500/40 text-teal-600 bg-teal-500/10 dark:text-teal-400",
                        )}
                      >
                        {variancePercent > 0 ? "+" : ""}
                        {variancePercent}%
                      </Badge>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {ws.code} · Planned {ws.plannedHours.toFixed(1)}h
                  </p>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", ws.barClass)}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total logged effort</span>
            <span className="font-bold text-foreground">{totalLogged.toFixed(1)}h</span>
          </div>
        </Card>
      </div>

      {/* Milestone & defect velocity table */}
      <Card className="border-border-subtle bg-canvas-surface p-5 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Icon icon={TrendingUp} size={15} className="text-teal-600 dark:text-teal-400" />
            <h4 className="font-bold text-sm text-foreground">
              Sprint Milestone &amp; Defect Velocity
            </h4>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
          >
            <Icon icon={Download} size={13} />
            Export CSV
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">
          Story points, hour variance, commit volume, and defects per active workstream
        </p>

        <table className="w-full min-w-[640px] text-xs border-collapse">
          <thead>
            <tr className="border-b border-border-subtle text-[10px] uppercase tracking-wide text-muted-foreground">
              <th className="text-left font-semibold py-2 pr-3">Workstream</th>
              <th className="text-right font-semibold py-2 px-3">Planned Pts</th>
              <th className="text-right font-semibold py-2 px-3">Delivered Pts</th>
              <th className="text-right font-semibold py-2 px-3">Hours Logged</th>
              <th className="text-right font-semibold py-2 px-3">Variance</th>
              <th className="text-right font-semibold py-2 px-3">Commits</th>
              <th className="text-right font-semibold py-2 px-3">Bugs</th>
              <th className="text-right font-semibold py-2 pl-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {WORKSTREAMS.map((ws) => {
              const variancePercent = Math.round(
                ((ws.loggedHours - ws.plannedHours) / ws.plannedHours) * 100,
              );
              return (
                <tr key={ws.id}>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full shrink-0", ws.dotClass)} />
                      <span className="font-semibold text-foreground">{ws.name}</span>
                    </div>
                  </td>
                  <td className="text-right py-2.5 px-3 text-muted-foreground">
                    {ws.plannedPoints} pts
                  </td>
                  <td className="text-right py-2.5 px-3 font-semibold text-foreground">
                    {ws.deliveredPoints} pts
                  </td>
                  <td className="text-right py-2.5 px-3 text-muted-foreground">
                    {ws.loggedHours.toFixed(1)}h / {ws.plannedHours.toFixed(1)}h
                  </td>
                  <td
                    className={cn(
                      "text-right py-2.5 px-3 font-semibold",
                      variancePercent > 5
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-teal-600 dark:text-teal-400",
                    )}
                  >
                    {variancePercent > 0 ? "+" : ""}
                    {variancePercent}%
                  </td>
                  <td className="text-right py-2.5 px-3 text-muted-foreground">
                    {ws.commits}
                  </td>
                  <td className="text-right py-2.5 px-3 text-muted-foreground">
                    {ws.bugs}
                  </td>
                  <td className="text-right py-2.5 pl-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] px-1.5 py-0 font-bold",
                        STATUS_BADGE_CLASSES[ws.status],
                      )}
                    >
                      {ws.status}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border-subtle text-[11px] font-semibold">
              <td className="py-2.5 pr-3 text-foreground">Total</td>
              <td className="text-right py-2.5 px-3 text-foreground">{totalPlannedPts} pts</td>
              <td className="text-right py-2.5 px-3 text-foreground">{totalDeliveredPts} pts</td>
              <td className="text-right py-2.5 px-3 text-foreground">
                {totalLogged.toFixed(1)}h / {totalPlanned.toFixed(1)}h
              </td>
              <td className="text-right py-2.5 px-3" />
              <td className="text-right py-2.5 px-3 text-foreground">{totalCommits}</td>
              <td className="text-right py-2.5 px-3 text-foreground">{totalBugs}</td>
              <td className="py-2.5 pl-3" />
            </tr>
          </tfoot>
        </table>
      </Card>
    </div>
  );
}
