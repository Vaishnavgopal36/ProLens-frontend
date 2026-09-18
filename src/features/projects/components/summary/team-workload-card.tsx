import { Gauge } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import type { ProjectMember } from "@/types/project";

interface TeamWorkloadCardProps {
  members: ProjectMember[];
}

export function TeamWorkloadCard({ members }: TeamWorkloadCardProps) {
  const totalAssigned = Math.max(
    1,
    members.reduce((sum, m) => sum + m.assignedTasksCount, 0),
  );

  const rows = [...members]
    .sort((a, b) => b.assignedTasksCount - a.assignedTasksCount)
    .map((m) => ({
      member: m,
      percent: Math.round((m.assignedTasksCount / totalAssigned) * 100),
    }));

  return (
    <Card className="border-border-subtle bg-canvas-surface p-5 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <Icon
            icon={Gauge}
            size={15}
            className="text-teal-600 dark:text-teal-400"
          />
          <h3 className="text-sm font-semibold text-foreground">
            Team Workload
          </h3>
        </div>
        <span className="text-[11px] font-medium text-muted-foreground">
          Manager view
        </span>
      </div>

      <div className="space-y-3 pt-1">
        {rows.map(({ member, percent }) => (
          <div key={member.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground truncate pr-2">
                {member.name}
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                {member.assignedTasksCount} tasks · {percent}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-teal-500 transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
