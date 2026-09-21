import * as React from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { MOCK_ACTIVITIES } from "../api/mock-data";

export function UpcomingActivities() {
  return (
    <Card className="border-border-subtle bg-canvas-surface p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            Upcoming activities
          </h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
            {MOCK_ACTIVITIES.length} scheduled
          </span>
        </div>

        {/* Updated Navigation Link */}
        <Link
          to="/calendar"
          className="flex items-center gap-1 text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
        >
          <span>View calendar</span>
          <Icon icon={ArrowRight} size={13} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {MOCK_ACTIVITIES.map((activity) => (
          <div
            key={activity.id}
            className="flex flex-col justify-between rounded-lg border border-border-subtle bg-canvas-bg/50 p-3.5 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold text-foreground">
                {activity.title}
              </span>
              <Badge
                variant={
                  activity.type === "Project Activity" ? "secondary" : "neutral"
                }
                className="text-[9px] px-1.5 py-0 uppercase"
              >
                {activity.type}
              </Badge>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Icon icon={Calendar} size={12} className="opacity-70" />
                <span>{activity.time}</span>
              </div>
              <p className="text-[11px] font-medium text-foreground/80 truncate">
                {activity.project}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}