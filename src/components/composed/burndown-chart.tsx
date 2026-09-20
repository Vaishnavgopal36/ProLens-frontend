import * as React from "react";
import { cn } from "@/lib/utils";

interface BurndownChartProps {
  /** Starting effort — the ideal line runs from this down to 0. */
  totalHours: number;
  /** Hours logged per day so far; length = "today" (days elapsed). */
  dailyDeltas: number[];
  totalDays: number;
  todayDay: number;
}

// The same burndown chart used in a project's Reports tab, reused wherever
// else a sprint/effort trajectory needs to be shown (e.g. Insights) so there
// is exactly one implementation of this chart type in the app.
export function BurndownChart({
  totalHours,
  dailyDeltas,
  totalDays,
  todayDay,
}: BurndownChartProps) {
  const { remaining, ideal, idealPerDay } = React.useMemo(() => {
    const remainingSeries: number[] = [totalHours];
    let cumulative = 0;
    for (const delta of dailyDeltas) {
      cumulative += delta;
      remainingSeries.push(totalHours - cumulative);
    }
    const perDay = totalHours / totalDays;
    const idealSeries = Array.from({ length: totalDays + 1 }, (_, day) =>
      Math.max(0, totalHours - perDay * day),
    );
    return {
      remaining: remainingSeries,
      ideal: idealSeries,
      idealPerDay: perDay,
    };
  }, [totalHours, dailyDeltas, totalDays]);

  const width = 640;
  const height = 220;
  const padL = 36;
  const padR = 12;
  const padT = 16;
  const padB = 24;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const xFor = (day: number) => padL + (day / totalDays) * plotW;
  const yFor = (hours: number) => padT + plotH - (hours / totalHours) * plotH;

  const idealPoints = ideal
    .map((h, day) => `${xFor(day)},${yFor(h)}`)
    .join(" ");
  const actualPoints = remaining
    .map((h, day) => `${xFor(day)},${yFor(h)}`)
    .join(" ");

  const todayRemaining = remaining[remaining.length - 1];
  const avgBurnRate = (totalHours - todayRemaining) / todayDay;
  const projectedDaysLeft = todayRemaining / Math.max(0.1, avgBurnRate);
  const projectedEndDay = todayDay + projectedDaysLeft;
  const slipDays = Math.round(projectedEndDay - totalDays);

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
      >
        {/* Horizontal gridlines + y labels */}
        {gridLines.map((frac) => {
          const y = padT + plotH * (1 - frac);
          const hours = Math.round(totalHours * frac);
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
              <text
                x={4}
                y={y + 3}
                fontSize={9}
                fill="currentColor"
                opacity={0.6}
              >
                {hours}h
              </text>
            </g>
          );
        })}

        {/* Daily logged bars */}
        {dailyDeltas.map((delta, i) => {
          const day = i + 1;
          const barH = (delta / totalHours) * plotH * 0.9;
          const x = xFor(day) - 8;
          return (
            <rect
              key={day}
              x={x}
              y={padT + plotH - barH}
              width={16}
              height={barH}
              className="fill-teal-500 opacity-15"
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
          x1={xFor(todayDay)}
          x2={xFor(todayDay)}
          y1={padT}
          y2={padT + plotH}
          className="stroke-teal-500"
          strokeDasharray="2 2"
          strokeOpacity={0.5}
        />
        <circle
          cx={xFor(todayDay)}
          cy={yFor(todayRemaining)}
          r={3.5}
          className="fill-teal-600 dark:fill-teal-400"
        />
        <text
          x={xFor(todayDay) + 6}
          y={yFor(todayRemaining) - 6}
          fontSize={10}
          fontWeight={600}
          className="fill-foreground"
        >
          Today (Day {todayDay}): {todayRemaining.toFixed(1)}h left
        </text>

        {/* X axis day labels */}
        {[0, todayDay, totalDays].map((day) => (
          <text
            key={day}
            x={xFor(day)}
            y={height - 6}
            fontSize={9}
            textAnchor={
              day === 0 ? "start" : day === totalDays ? "end" : "middle"
            }
            fill="currentColor"
            opacity={0.6}
          >
            {day === 0 ? "Start" : day === totalDays ? "End" : `D${day}`}
          </text>
        ))}
      </svg>

      <div className="mt-3 flex items-center gap-4 text-2xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span
            className="h-0.5 w-4 rounded-full bg-foreground/40"
            style={{ borderTop: "1.5px dashed currentColor" }}
          />
          Ideal burn
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full bg-teal-500" />
          Actual remaining
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
        <div className="rounded-lg border border-border-subtle p-2.5">
          <p className="text-3xs uppercase tracking-wide text-muted-foreground font-semibold">
            Planned burn
          </p>
          <p className="font-bold text-foreground">
            {idealPerDay.toFixed(1)}h/day
          </p>
        </div>
        <div className="rounded-lg border border-border-subtle p-2.5">
          <p className="text-3xs uppercase tracking-wide text-muted-foreground font-semibold">
            Actual burn
          </p>
          <p className="font-bold text-foreground">
            {avgBurnRate.toFixed(1)}h/day
          </p>
        </div>
        <div className="rounded-lg border border-border-subtle p-2.5">
          <p className="text-3xs uppercase tracking-wide text-muted-foreground font-semibold">
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
