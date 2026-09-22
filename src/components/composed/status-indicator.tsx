import { cn } from "@/lib/utils";

export interface StatusIndicatorProps {
  status: string;
  label?: string;
  className?: string;
  dotClassName?: string;
  textClassName?: string;
}

interface StatusConfig {
  label: string;
  colorClass: string;
}

function getStatusConfig(status: string, customLabel?: string): StatusConfig {
  const normalized = status.toLowerCase().replace(/[-_]/g, " ").trim();

  switch (normalized) {
    case "active":
    case "ongoing":
    case "in progress":
      return {
        label:
          customLabel ??
          (normalized === "in progress"
            ? "In Progress"
            : normalized.charAt(0).toUpperCase() + normalized.slice(1)),
        colorClass: "bg-emerald-500",
      };

    case "pending":
    case "on hold":
    case "to do":
    case "backlog":
      return {
        label:
          customLabel ??
          (normalized === "on hold"
            ? "On Hold"
            : normalized === "to do"
              ? "To Do"
              : normalized.charAt(0).toUpperCase() + normalized.slice(1)),
        colorClass: "bg-amber-500",
      };

    case "completed":
    case "done":
    case "delivered":
      return {
        label:
          customLabel ??
          normalized.charAt(0).toUpperCase() + normalized.slice(1),
        colorClass: "bg-slate-400 dark:bg-slate-500",
      };

    case "delayed":
    case "urgent":
    case "at risk":
      return {
        label:
          customLabel ??
          (normalized === "at risk"
            ? "At Risk"
            : normalized.charAt(0).toUpperCase() + normalized.slice(1)),
        colorClass: "bg-rose-500",
      };

    default: {
      const formatted = status
        .split(/[-_\s]+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
      return {
        label: customLabel ?? formatted,
        colorClass: "bg-slate-400",
      };
    }
  }
}

/**
 * StatusIndicator: Clean, minimal plain-text status display
 * paired with a subtle status circle dot.
 */
export function StatusIndicator({
  status,
  label: customLabel,
  className,
  dotClassName,
  textClassName,
}: StatusIndicatorProps) {
  const { label, colorClass } = getStatusConfig(status, customLabel);

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "h-2 w-2 rounded-full shrink-0",
          colorClass,
          dotClassName,
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          "text-sm font-medium text-foreground whitespace-nowrap leading-none",
          textClassName,
        )}
      >
        {label}
      </span>
    </div>
  );
}
