import { GanttChartSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import type { Project } from "@/types/project";

interface GanttStream {
  id: string;
  name: string;
  dateRange: string;
  progress: number;
  /** Position of the bar within the track, as a percentage. */
  offsetPercent: number;
  widthPercent: number;
  color: "teal-500" | "teal-600" | "amber-500";
}

const STREAMS: GanttStream[] = [
  {
    id: "s-1",
    name: "Design System",
    dateRange: "Sep 1 - Sep 30",
    progress: 75,
    offsetPercent: 0,
    widthPercent: 75,
    color: "teal-500",
  },
  {
    id: "s-2",
    name: "Authentication",
    dateRange: "Sep 15 - Oct 15",
    progress: 52,
    offsetPercent: 25,
    widthPercent: 50,
    color: "teal-600",
  },
  {
    id: "s-3",
    name: "Reporting",
    dateRange: "Oct 1 - Oct 31",
    progress: 25,
    offsetPercent: 50,
    widthPercent: 40,
    color: "amber-500",
  },
  {
    id: "s-4",
    name: "QA & Hardening",
    dateRange: "Nov 1 - Nov 20",
    progress: 10,
    offsetPercent: 70,
    widthPercent: 25,
    color: "amber-500",
  },
];

const BAR_COLOR_CLASSES: Record<GanttStream["color"], string> = {
  "teal-500": "bg-teal-500 text-white",
  "teal-600": "bg-teal-600 text-white",
  "amber-500": "bg-amber-500 text-navy-900 dark:text-background",
};

interface TimelineTabProps {
  project: Project;
  selectedMemberId?: string | null;
}

export function TimelineTab({ project }: TimelineTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon
              icon={GanttChartSquare}
              size={15}
              className="text-teal-600 dark:text-teal-400"
            />
            <h4 className="font-bold text-sm text-foreground">
              Project Gantt &amp; Stream Timeline
            </h4>
          </div>
          <span className="text-xs text-muted-foreground">
            {project.dateRange}
          </span>
        </div>

        <div className="flex flex-col gap-4 text-xs">
          {STREAMS.map((stream) => (
            <div key={stream.id} className="flex items-center gap-4">
              <span className="w-28 shrink-0 font-semibold text-foreground truncate">
                {stream.name}
              </span>
              <div className="flex-1 bg-muted h-6 rounded-lg overflow-hidden relative">
                <div
                  className={`absolute h-full rounded-lg font-bold text-[10px] flex items-center px-2 whitespace-nowrap ${BAR_COLOR_CLASSES[stream.color]}`}
                  style={{
                    left: `${stream.offsetPercent}%`,
                    width: `${stream.widthPercent}%`,
                  }}
                >
                  {stream.dateRange} ({stream.progress}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
