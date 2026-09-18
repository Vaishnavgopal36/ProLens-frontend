import { Card } from "@/components/ui/card";
import type { Project } from "@/types/project";

interface ReportStat {
  id: string;
  label: string;
  value: string;
  subtext: string;
  valueClassName?: string;
}

const MOCK_STATS: ReportStat[] = [
  {
    id: "velocity",
    label: "Sprint 4 Velocity",
    value: "38 Pts",
    subtext: "+12% vs Sprint 3",
  },
  {
    id: "cycle-time",
    label: "Cycle Time",
    value: "2.8 Days",
    subtext: "Faster than 3.4 target",
  },
  {
    id: "defects",
    label: "Escaped Defects",
    value: "0",
    subtext: "High Quality Gate",
    valueClassName: "text-teal-600 dark:text-teal-400",
  },
];

interface ReportsTabProps {
  project: Project;
  selectedMemberId?: string | null;
}

export function ReportsTab({ project: _project, selectedMemberId: _selectedMemberId }: ReportsTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="border-border-subtle bg-canvas-surface p-5 shadow-xs">
        <h4 className="font-bold text-sm text-foreground mb-2">
          Sprint Velocity &amp; Burn-Down Reports
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
          {MOCK_STATS.map((stat) => (
            <div
              key={stat.id}
              className="p-4 rounded-xl bg-muted/50 border border-border-subtle"
            >
              <span className="text-muted-foreground font-semibold">
                {stat.label}
              </span>
              <div
                className={
                  "text-2xl font-extrabold mt-1 " +
                  (stat.valueClassName ?? "text-foreground")
                }
              >
                {stat.value}
              </div>
              <span className="text-teal-600 dark:text-teal-400 font-medium">
                {stat.subtext}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
