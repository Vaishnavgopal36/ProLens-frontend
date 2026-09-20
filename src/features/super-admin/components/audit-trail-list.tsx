import {
  PlusCircle,
  Ban,
  CheckCircle2,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import type { AuditEventType, AuditLogEntry } from "../api/types";

const EVENT_ICON: Record<AuditEventType, LucideIcon> = {
  org_created: PlusCircle,
  org_suspended: Ban,
  org_activated: CheckCircle2,
  admin_assigned: UserCog,
};

const EVENT_ICON_CLASSES: Record<AuditEventType, string> = {
  org_created: "text-teal-600 dark:text-teal-400 bg-teal-500/10",
  org_suspended: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
  org_activated: "text-teal-600 dark:text-teal-400 bg-teal-500/10",
  admin_assigned: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
};

interface AuditTrailListProps {
  entries: AuditLogEntry[];
}

export function AuditTrailList({ entries }: AuditTrailListProps) {
  return (
    <Card className="border-border-subtle bg-canvas-surface p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Recent audit trail
        </h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-3xs font-bold text-muted-foreground">
          {entries.length} events
        </span>
      </div>

      {entries.length > 0 ? (
        <div className="divide-y divide-border-subtle">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div
                className={
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full " +
                  EVENT_ICON_CLASSES[entry.type]
                }
              >
                <Icon icon={EVENT_ICON[entry.type]} size={13} />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-xs font-semibold text-foreground leading-none">
                  {entry.message}
                </p>
                <p className="text-2xs text-muted-foreground">
                  {entry.organization} · {entry.actor}
                </p>
              </div>
              <span className="shrink-0 text-2xs text-muted-foreground">
                {entry.timestamp}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-xs text-muted-foreground">
          No audit events yet.
        </p>
      )}
    </Card>
  );
}
