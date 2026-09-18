import * as React from "react";
import { History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  {
    id: "a-5",
    user: "Sarah Jenkins",
    initials: "SJ",
    avatarBg: "bg-navy-500",
    action: "closed sprint retrospective",
    target: "Sprint 3",
    timeAgo: "Yesterday at 5:14 PM",
  },
];

export function RecentActivityCard() {
  const [userFilter, setUserFilter] = React.useState("all");

  const uniqueUsers = React.useMemo(
    () => Array.from(new Set(ACTIVITIES.map((a) => a.user))),
    [],
  );

  const visibleActivities = React.useMemo(() => {
    if (userFilter === "all") return ACTIVITIES;
    return ACTIVITIES.filter((a) => a.user === userFilter);
  }, [userFilter]);

  return (
    <Card className="border-border-subtle bg-canvas-surface p-5 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon
            icon={History}
            size={15}
            className="text-teal-600 dark:text-teal-400 shrink-0"
          />
          <h3 className="text-sm font-semibold text-foreground truncate">
            Recent Activity
          </h3>
        </div>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="h-7 w-auto text-[11px] bg-canvas-bg border-border-subtle px-2 gap-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Everyone</SelectItem>
            {uniqueUsers.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {visibleActivities.length === 0 && (
          <p className="py-4 text-center text-xs text-muted-foreground">
            No activity from {userFilter}.
          </p>
        )}
        {visibleActivities.map((item) => (
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
