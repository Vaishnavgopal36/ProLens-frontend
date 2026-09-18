import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import type { Project } from "@/types/project";
import type { UserRole } from "@/app/providers";

interface ProjectTeamWidgetProps {
  project: Project;
  onManageClick: () => void;
  userRole?: UserRole;
}

export function ProjectTeamWidget({
  project,
  onManageClick,
  userRole,
}: ProjectTeamWidgetProps) {
  const members = project.members || [];
  const displayMembers = members.slice(0, 3);
  const remainingCount = members.length > 3 ? members.length - 3 : 0;
  const isManager =
    userRole === "manager" ||
    userRole === "admin" ||
    userRole === "super_admin";

  return (
    <Card className="border-border-subtle bg-canvas-surface p-5 space-y-3 shadow-xs">
      <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
        <Icon
          icon={Users}
          size={15}
          className="text-teal-600 dark:text-teal-400"
        />
        <h3 className="text-sm font-semibold text-foreground">Project Team</h3>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-1.5 overflow-hidden">
            {displayMembers.map((m) => (
              <Avatar
                key={m.id}
                className="h-7 w-7 border-2 border-canvas-surface"
              >
                <AvatarImage src={m.avatarUrl} alt={m.name} />
                <AvatarFallback className="text-[10px] font-bold bg-navy-500 text-white dark:bg-foreground dark:text-background">
                  {m.initials}
                </AvatarFallback>
              </Avatar>
            ))}
            {remainingCount > 0 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-canvas-surface bg-muted text-[10px] font-bold text-muted-foreground">
                +{remainingCount}
              </div>
            )}
          </div>

          <div className="text-xs">
            <p className="font-semibold text-foreground">
              {members.length} Team Members
            </p>
            <p className="text-[11px] text-muted-foreground">
              All roles allocated
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onManageClick}
          className="h-8 text-xs font-semibold px-3"
        >
          {isManager ? "Manage" : "View Directory"}
        </Button>
      </div>
    </Card>
  );
}
