import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MetricCardData } from "@/types/dashboard";

interface MetricCardProps {
  data: MetricCardData;
}

export function MetricCard({ data }: MetricCardProps) {
  return (
    <Card
      className={cn(
        "p-4 sm:p-5 transition-all border-border-subtle bg-canvas-surface",
        // When highlight is true (the amber "Tasks needing attention" card in manager view)
        data.highlight &&
          "border-amber-400/40 bg-amber-500/10 dark:bg-amber-500/15",
      )}
    >
      {/* Top row: Label and optional Badge */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {data.label}
        </span>
        {data.badge && (
          <Badge
            variant={data.badge.variant}
            className="text-3xs px-1.5 py-0 font-bold uppercase tracking-wider"
          >
            {data.badge.text}
          </Badge>
        )}
      </div>

      {/* Main value: Big bold statistic */}
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-foreground">
          {data.value}
        </span>
      </div>

      {/* Bottom Subtext */}
      {data.subtext && (
        <p className="mt-1 text-xs text-muted-foreground">{data.subtext}</p>
      )}
    </Card>
  );
}
