import { Calendar, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { MOCK_ACTIVITIES } from "../api/mock-data";

export function UpcomingActivities() {
  return (
    <Card className="border-border-subtle bg-canvas-surface p-5 space-y-4">
      {/* Header with Title and "View calendar" link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            Upcoming activities
          </h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-3xs font-bold text-muted-foreground">
            {MOCK_ACTIVITIES.length} scheduled
          </span>
        </div>

        <button
          type="button"
          className="flex items-center gap-1 text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span>View calendar</span>
          <Icon icon={ArrowRight} size={13} />
        </button>
      </div>

      {/* 3-Column Activity Cards */}
      {MOCK_ACTIVITIES.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {MOCK_ACTIVITIES.map((activity) => (
            <div
              key={activity.id}
              className="flex flex-col justify-between rounded-lg border border-border-subtle bg-canvas-bg/50 p-3.5 space-y-3"
            >
              {/* Title & Badge */}
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {activity.title}
                </span>
                <Badge
                  variant={
                    activity.type === "Project Activity"
                      ? "secondary"
                      : "neutral"
                  }
                  className="text-4xs px-1.5 py-0 uppercase"
                >
                  {activity.type}
                </Badge>
              </div>

              {/* Time & Associated Project */}
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Icon icon={Calendar} size={12} className="opacity-70" />
                  <span>{activity.time}</span>
                </div>
                <p className="text-2xs font-medium text-foreground/80 truncate">
                  {activity.project}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-xs text-muted-foreground">
          No upcoming activities scheduled.
        </p>
      )}
    </Card>
  );
}
