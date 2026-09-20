import { Building2, Users, FolderKanban, Mail } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { TenantDetail } from "../api/types";

interface TenantInspectorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: TenantDetail | undefined;
}

export function TenantInspectorDrawer({
  open,
  onOpenChange,
  tenant,
}: TenantInspectorDrawerProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="flex flex-col sm:max-w-md overflow-y-auto">
        {tenant && (
          <>
            <ModalHeader>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-500/10 text-navy-600 dark:text-foreground/80 border border-navy-500/20 shrink-0">
                  <Icon icon={Building2} size={17} />
                </div>
                <div>
                  <ModalTitle>{tenant.organization.name}</ModalTitle>
                  <ModalDescription>
                    /{tenant.organization.slug}
                  </ModalDescription>
                </div>
              </div>
            </ModalHeader>

            <div className="space-y-6 pt-2">
              <div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-3xs uppercase font-bold px-2 py-0.5",
                    tenant.organization.status === "active"
                      ? "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800"
                      : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
                  )}
                >
                  {tenant.organization.status}
                </Badge>
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border-subtle bg-canvas-bg/50 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon icon={FolderKanban} size={13} />
                    <span>Active projects</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {tenant.organization.activeProjects}
                  </p>
                </div>
                <div className="rounded-lg border border-border-subtle bg-canvas-bg/50 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon icon={Users} size={13} />
                    <span>Total members</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {tenant.organization.totalMembers}
                  </p>
                </div>
              </div>

              {/* Primary contact */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-foreground">
                  Primary Contact
                </h4>
                <div className="rounded-lg border border-border-subtle bg-canvas-bg/50 p-3 space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">
                    {tenant.organization.primaryContact.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-2xs text-muted-foreground">
                    <Icon icon={Mail} size={11} />
                    <span>{tenant.organization.primaryContact.email}</span>
                  </div>
                </div>
              </div>

              {/* Designation breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-foreground">
                  Designations
                </h4>
                <div className="divide-y divide-border-subtle rounded-lg border border-border-subtle bg-canvas-bg/50">
                  {tenant.designationBreakdown.map((d) => (
                    <div
                      key={d.designation}
                      className="flex items-center justify-between px-3 py-2"
                    >
                      <span className="text-xs text-foreground">
                        {d.designation}
                      </span>
                      <span className="text-xs font-mono font-semibold text-muted-foreground">
                        {d.count}
                      </span>
                    </div>
                  ))}
                  {tenant.designationBreakdown.length === 0 && (
                    <p className="px-3 py-2 text-xs text-muted-foreground">
                      No members recorded.
                    </p>
                  )}
                </div>
              </div>

              {/* Recent projects */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-foreground">
                  Projects
                </h4>
                <div className="divide-y divide-border-subtle rounded-lg border border-border-subtle bg-canvas-bg/50">
                  {tenant.recentProjects.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between px-3 py-2"
                    >
                      <span className="text-xs text-foreground">{p.name}</span>
                      <span className="text-3xs font-semibold text-muted-foreground uppercase">
                        {p.status}
                      </span>
                    </div>
                  ))}
                  {tenant.recentProjects.length === 0 && (
                    <p className="px-3 py-2 text-xs text-muted-foreground">
                      No active projects.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
