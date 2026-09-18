import { History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";

interface ActivityEvent {
  id: string;
  user: string;
  initials: string;
  avatarBg: string;
  action: string;
  target: string;
  timeAgo: string;
}

const ACTIVITIES: ActivityEvent[] = [
  {
    id: "a-1",
    user: "Sarah Jenkins",
    initials: "SJ",
    avatarBg: "bg-navy-500",
    action: "created milestone stream",
    target: "Authentication",
    timeAgo: "18 minutes ago",
  },
  {
    id: "a-2",
    user: "Alex Morgan",
    initials: "AM",
    avatarBg: "bg-teal-600",
    action: "moved UI Design to",
    target: "Done",
    timeAgo: "1 hour ago",
  },
  {
    id: "a-3",
    user: "Elena Rostova",
    initials: "ER",
    avatarBg: "bg-amber-600",
    action: "updated sub-tasks on",
    target: "API Integration",
    timeAgo: "3 hours ago",
  },
  {
    id: "a-4",
    user: "Sarah Jenkins",
    initials: "SJ",
    avatarBg: "bg-navy-500",
    action: "closed sprint retrospective",
    target: "Sprint 3",
    timeAgo: "Yesterday at 5:14 PM",
  },
];

export function RecentActivityCard() {
  return (
    <Card className="border-border-subtle bg-canvas-surface p-5 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <Icon
            icon={History}
            size={15}
            className="text-teal-600 dark:text-teal-400"
          />
          <h3 className="text-sm font-semibold text-foreground">
            Recent Activity
          </h3>
        </div>
        <button
          type="button"
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 hover:underline"
        >
          View all activity
        </button>
      </div>

      <div className="space-y-3">
        {ACTIVITIES.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <Avatar className="h-7 w-7 shrink-0 border border-border-subtle mt-0.5">
              <AvatarFallback
                className={`text-[10px] font-bold text-white ${item.avatarBg}`}
              >
                {item.initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 text-xs">
              <p className="text-foreground leading-snug">
                <strong className="font-semibold">{item.user}</strong>{" "}
                {item.action}{" "}
                <span className="font-semibold text-teal-600 dark:text-teal-400">
                  {item.target}
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {item.timeAgo}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
