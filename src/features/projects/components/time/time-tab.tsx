import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/types/project";

type StreamStatus = "ACTIVE" | "COMPLETED" | "PLANNING";

interface TimeStream {
  id: string;
  status: StreamStatus;
  name: string;
  hoursLogged: number;
  hoursEstimated: number;
  tasks: string;
}

const MOCK_STREAMS: TimeStream[] = [
  {
    id: "ts-1",
    status: "ACTIVE",
    name: "Design System & Tokens",
    hoursLogged: 34.5,
    hoursEstimated: 48,
    tasks: "UI Design & Prototyping (PROL-12), Color Token System (PROL-04)",
  },
  {
    id: "ts-2",
    status: "COMPLETED",
    name: "Information Architecture & Navigation",
    hoursLogged: 18.0,
    hoursEstimated: 20,
    tasks: "IA Wireframes (PROL-01), User Flow Validation",
  },
  {
    id: "ts-3",
    status: "PLANNING",
    name: "Reporting & Analytics Views",
    hoursLogged: 9.5,
    hoursEstimated: 24,
    tasks: "Telemetry UI Specs (PROL-24), Dashboard Polish",
  },
];

const STATUS_META: Record<
  StreamStatus,
  { badgeClassName: string; valueClassName: string; barClassName: string }
> = {
  ACTIVE: {
    badgeClassName:
      "bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400 border-transparent",
    valueClassName: "text-teal-600 dark:text-teal-400",
    barClassName: "bg-teal-500",
  },
  COMPLETED: {
    badgeClassName:
      "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border-transparent",
    valueClassName: "text-teal-600 dark:text-teal-400",
    barClassName: "bg-teal-600",
  },
  PLANNING: {
    badgeClassName:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-transparent",
    valueClassName: "text-amber-600 dark:text-amber-400",
    barClassName: "bg-amber-500",
  },
};

interface TimeTabProps {
  project: Project;
  selectedMemberId?: string | null;
}

export function TimeTab({ project: _project, selectedMemberId: _selectedMemberId }: TimeTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="border-border-subtle bg-canvas-surface p-5 shadow-xs">
        <div className="flex flex-col gap-3 text-xs">
          {MOCK_STREAMS.map((stream) => {
            const meta = STATUS_META[stream.status];
            const percentage = Math.round(
              (stream.hoursLogged / stream.hoursEstimated) * 100,
            );

            return (
              <div
                key={stream.id}
                className="p-3.5 bg-muted/50 rounded-xl border border-border-subtle flex flex-col gap-2.5 hover:bg-muted transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge
                      variant="outline"
                      className={
                        "px-2 py-0.5 rounded text-[10px] font-bold " +
                        meta.badgeClassName
                      }
                    >
                      {stream.status}
                    </Badge>
                    <span className="font-semibold text-sm text-foreground truncate">
                      {stream.name}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={"text-sm font-bold " + meta.valueClassName}>
                      {stream.hoursLogged.toFixed(1)}h
                    </span>
                    <span className="text-muted-foreground text-xs font-normal ml-1">
                      / {stream.hoursEstimated}h ({percentage}%)
                    </span>
                  </div>
                </div>

                <p className="text-muted-foreground text-xs">
                  Tasks: {stream.tasks}
                </p>

                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={"h-full rounded-full " + meta.barClassName}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
