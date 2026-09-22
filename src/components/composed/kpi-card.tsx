import * as React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { KpiAlertLink } from "./kpi-alert-link";
import type { MetricCardData } from "@/types/dashboard";

export interface KpiCardProps {
  /** Optional data object matching MetricCardData */
  data?: MetricCardData;
  label?: string;
  value?: string | number;
  subtext?: string;
  alertLink?: { to: string; label: string };
  badge?: {
    text: string;
    variant?: "success" | "warning" | "destructive" | "neutral";
  };
  trend?: {
    value: string | number;
    direction?: "up" | "down" | "neutral";
    timeframe?: string;
  };
  /**
   * Whether an upward trend is considered positive/good.
   * Default is true.
   * If false, increases (e.g. 4xx/5xx errors, defects) render rose/red rather than emerald/green.
   */
  isPositiveGood?: boolean;
  /** Telemetry series data points for sparkline */
  sparklineData?: number[] | null;
  /**
   * Flag indicating telemetry presence.
   * When false or data is null/empty, renders dashed line with "No data" pill.
   */
  hasTelemetry?: boolean;
  /** Custom stroke color class (e.g. stroke-sky-500, stroke-teal-500) */
  strokeColor?: string;
  className?: string;
}

/**
 * Pure SVG Sparkline with Catmull-Rom cubic Bezier smoothing,
 * bounded area gradient fill, and Cloudflare-style telemetry states.
 */
function Sparkline({
  id,
  data,
  strokeColor,
}: {
  id: string;
  data: number[];
  strokeColor: string;
}) {
  const gradientId = `kpi-spark-grad-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const WIDTH = 160;
  const HEIGHT = 36;
  const PAD_X = 2;
  const PAD_Y = 3;
  const BASELINE_Y = HEIGHT - PAD_Y; // 33
  const USABLE_W = WIDTH - PAD_X * 2; // 156
  const USABLE_H = HEIGHT - PAD_Y * 2; // 30

  const isAllEqual = data.every((v) => v === data[0]);

  if (isAllEqual) {
    const yPos = data[0] === 0 ? BASELINE_Y : HEIGHT / 2;
    return (
      <div className="h-10 w-full relative overflow-visible">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className={cn("w-full h-10 overflow-visible", strokeColor)}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line
            x1={PAD_X}
            y1={yPos}
            x2={WIDTH - PAD_X}
            y2={yPos}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx={WIDTH - PAD_X} cy={yPos} r="2" fill="currentColor" />
        </svg>
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  const points = data.map((val, i) => {
    const x =
      data.length === 1
        ? WIDTH / 2
        : PAD_X + (i / (data.length - 1)) * USABLE_W;
    const y = BASELINE_Y - ((val - min) / range) * USABLE_H;
    return { x, y };
  });

  let linePath = `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
  if (points.length === 2) {
    linePath += ` L ${points[1].x.toFixed(2)},${points[1].y.toFixed(2)}`;
  } else if (points.length > 2) {
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(i + 2, points.length - 1)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      let cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      let cp2y = p2.y - (p3.y - p1.y) / 6;

      // Clamp control points within boundary to prevent curve overshoot
      cp1y = Math.min(Math.max(cp1y, PAD_Y), BASELINE_Y);
      cp2y = Math.min(Math.max(cp2y, PAD_Y), BASELINE_Y);

      linePath += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
    }
  }

  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const areaPath = `${linePath} L ${lastPoint.x.toFixed(2)},${BASELINE_Y} L ${firstPoint.x.toFixed(2)},${BASELINE_Y} Z`;

  return (
    <div className="h-10 w-full relative overflow-visible">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className={cn("w-full h-10 overflow-visible", strokeColor)}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" />
            <stop offset="85%" stopColor="currentColor" stopOpacity="0.02" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={lastPoint.x} cy={lastPoint.y} r="2" fill="currentColor" />
      </svg>
    </div>
  );
}

/**
 * Cloudflare-styled unified KpiCard component.
 * Features crisp typography, inline delta trends, and smooth area sparklines.
 */
export function KpiCard({
  data,
  label: propLabel,
  value: propValue,
  subtext: propSubtext,
  alertLink: propAlertLink,
  badge: propBadge,
  trend: propTrend,
  isPositiveGood = true,
  sparklineData: propSparklineData,
  hasTelemetry: propHasTelemetry,
  strokeColor = "text-sky-500 dark:text-sky-400 stroke-sky-500 dark:stroke-sky-400",
  className,
}: KpiCardProps) {
  const cardId = React.useId();

  // Resolve values from direct props or data object
  const label = propLabel ?? data?.label ?? "";
  const value = propValue ?? data?.value ?? "";
  const subtext = propSubtext ?? data?.subtext;
  const alertLink = propAlertLink ?? data?.alertLink;
  const badge = propBadge ?? data?.badge;
  const trend = propTrend ?? data?.trend;

  // Resolve sparkline telemetry
  const resolvedSparkline =
    propSparklineData !== undefined
      ? propSparklineData
      : data?.sparkline !== undefined
        ? data.sparkline
        : null;

  const hasTelemetry =
    propHasTelemetry !== undefined
      ? propHasTelemetry
      : resolvedSparkline !== null &&
        resolvedSparkline !== undefined &&
        resolvedSparkline.length > 0;

  // Determine trend presentation
  const resolvedTrend = React.useMemo(() => {
    if (!trend && (!resolvedSparkline || resolvedSparkline.length < 2)) {
      return null;
    }

    if (trend) {
      const rawVal = trend.value;
      const direction =
        trend.direction ??
        (typeof rawVal === "number"
          ? rawVal > 0
            ? "up"
            : rawVal < 0
              ? "down"
              : "neutral"
          : String(rawVal).startsWith("-")
            ? "down"
            : String(rawVal).startsWith("+")
              ? "up"
              : "neutral");

      const isPositive =
        trend.direction === "neutral"
          ? null
          : direction === "up"
            ? isPositiveGood
            : !isPositiveGood;

      const formatted =
        typeof rawVal === "number"
          ? rawVal > 0
            ? `+${rawVal}%`
            : `${rawVal}%`
          : String(rawVal);

      return {
        text: formatted,
        direction,
        isPositive,
        timeframe: trend.timeframe ?? "vs last 24h",
      };
    }

    // Derive from sparkline if present
    if (resolvedSparkline && resolvedSparkline.length >= 2) {
      const first = resolvedSparkline[0];
      const last = resolvedSparkline[resolvedSparkline.length - 1];

      if (first === 0 && last === 0) {
        return {
          text: "0.0%",
          direction: "neutral" as const,
          isPositive: null,
          timeframe: "vs last 24h",
        };
      }

      if (first === 0 && last > 0) {
        return {
          text: `+${last}`,
          direction: "up" as const,
          isPositive: isPositiveGood,
          timeframe: "vs last 24h",
        };
      }

      if (first === 0 && last < 0) {
        return {
          text: `${last}`,
          direction: "down" as const,
          isPositive: !isPositiveGood,
          timeframe: "vs last 24h",
        };
      }

      const pct = ((last - first) / Math.abs(first)) * 100;
      const direction = pct > 0.05 ? "up" : pct < -0.05 ? "down" : "neutral";
      const isPositive =
        direction === "neutral"
          ? null
          : direction === "up"
            ? isPositiveGood
            : !isPositiveGood;

      return {
        text: `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`,
        direction,
        isPositive,
        timeframe: "vs last 24h",
      };
    }

    return null;
  }, [trend, resolvedSparkline, isPositiveGood]);

  return (
    <div
      className={cn(
        "rounded-lg border border-border/70 bg-card p-4 flex flex-col justify-between h-[132px] relative overflow-hidden transition-colors hover:border-border",
        className,
      )}
    >
      {/* Top Row: Metric label + Alert Link / Badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-normal text-muted-foreground truncate">
          {label}
        </span>
        {alertLink ? (
          <KpiAlertLink to={alertLink.to} className="text-2xs font-medium">
            {alertLink.label}
          </KpiAlertLink>
        ) : badge ? (
          <span
            className={cn(
              "text-3xs font-semibold px-1.5 py-0.2 rounded uppercase tracking-wider",
              badge.variant === "destructive"
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : badge.variant === "warning"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {badge.text}
          </span>
        ) : subtext ? (
          <span className="text-3xs text-muted-foreground/70 truncate">
            {subtext}
          </span>
        ) : null}
      </div>

      {/* Mid Row: Primary Value + Inline Trend Delta */}
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
          {value}
        </span>

        {resolvedTrend && (
          <div className="inline-flex items-center gap-1 text-xs font-medium tabular-nums">
            {resolvedTrend.direction === "up" ? (
              <ArrowUpRight
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  resolvedTrend.isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400",
                )}
              />
            ) : resolvedTrend.direction === "down" ? (
              <ArrowDownRight
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  resolvedTrend.isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400",
                )}
              />
            ) : (
              <Minus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}

            <span
              className={cn(
                resolvedTrend.isPositive === true
                  ? "text-emerald-600 dark:text-emerald-400"
                  : resolvedTrend.isPositive === false
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-muted-foreground",
              )}
            >
              {resolvedTrend.text}
            </span>

            {resolvedTrend.timeframe && (
              <span className="text-3xs text-muted-foreground font-normal ml-0.5">
                {resolvedTrend.timeframe}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Row: Sparkline visualization */}
      <div className="mt-1">
        {hasTelemetry && resolvedSparkline && resolvedSparkline.length > 0 ? (
          <Sparkline
            id={cardId}
            data={resolvedSparkline}
            strokeColor={strokeColor}
          />
        ) : (
          <div className="h-10 w-full relative overflow-visible">
            <svg
              viewBox="0 0 160 36"
              className={cn("w-full h-10 overflow-visible", strokeColor)}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                x1={2}
                y1={33}
                x2={158}
                y2={33}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx={158} cy={33} r="2" fill="currentColor" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
