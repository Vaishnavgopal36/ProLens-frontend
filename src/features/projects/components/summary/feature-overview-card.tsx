import { Layers, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";

interface FeatureStream {
  id: string;
  name: string;
  status: "ACTIVE" | "PLANNING";
  progress: number;
  tasksCount: number;
}

const DEFAULT_STREAMS: FeatureStream[] = [
  {
    id: "f-1",
    name: "Design System",
    status: "ACTIVE",
    progress: 75,
    tasksCount: 8,
  },
  {
    id: "f-2",
    name: "Authentication",
    status: "ACTIVE",
    progress: 52,
    tasksCount: 5,
  },
  {
    id: "f-3",
    name: "Reporting",
    status: "PLANNING",
    progress: 25,
    tasksCount: 4,
  },
];

interface FeatureOverviewCardProps {
  onViewAll?: () => void;
}

export function FeatureOverviewCard({ onViewAll }: FeatureOverviewCardProps) {
  return (
    <Card className="border-border-subtle bg-canvas-surface p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <Icon
            icon={Layers}
            size={15}
            className="text-teal-600 dark:text-teal-400"
          />
          <h3 className="text-sm font-semibold text-foreground">
            Feature Overview
          </h3>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
        >
          <span>View all features</span>
          <Icon icon={ArrowRight} size={12} />
        </button>
      </div>

      <div className="space-y-4 pt-1">
        {DEFAULT_STREAMS.map((stream) => (
          <div key={stream.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {stream.name}
                </span>
                <Badge
                  variant="outline"
                  className={
                    stream.status === "ACTIVE"
                      ? "text-[9px] px-1.5 py-0 font-bold border-teal-500/30 text-teal-600 bg-teal-500/10 dark:text-teal-400"
                      : "text-[9px] px-1.5 py-0 font-bold border-amber-500/30 text-amber-600 bg-amber-500/10 dark:text-amber-400"
                  }
                >
                  {stream.status}
                </Badge>
              </div>

              <span className="text-[11px] font-medium text-muted-foreground">
                <strong className="text-foreground font-semibold">
                  {stream.progress}%
                </strong>{" "}
                • {stream.tasksCount} Tasks
              </span>
            </div>

            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  stream.status === "ACTIVE" ? "bg-teal-500" : "bg-amber-500"
                }`}
                style={{ width: `${stream.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
