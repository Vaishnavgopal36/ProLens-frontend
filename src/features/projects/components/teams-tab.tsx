import * as React from "react";
import { useModalHotkey } from "@/hooks/use-hotkey";
import { Plus } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { Project, ProjectMember, ProjectInvite } from "@/types/project";
import { TeamMembersTable } from "./teams/team-members-table";
import { InviteMemberDialog } from "./teams/invite-member-dialog";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface TeamsTabProps {
  project: Project;
}

export function TeamsTab({ project }: TeamsTabProps) {
  const { hasMinimumRole } = usePermissions();
  const isManager = hasMinimumRole("manager");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = React.useState(false);

  // Ctrl/⌘ + K toggles the invite-member dialog.
  useModalHotkey({
    open: isInviteDialogOpen,
    onOpen: () => setIsInviteDialogOpen(true),
    onClose: () => setIsInviteDialogOpen(false),
    disabled: !isManager,
  });
  const [members, setMembers] = React.useState(project.members);

  const loadMembers = React.useCallback(async () => {
    try {
      const res = await api.projects.listMembers(project.id);
      if (res && res.length > 0) {
        const mapped: ProjectMember[] = res.map((m) => {
          const email = m.user_email || "";
          const name = m.user_name || (email ? email.split("@")[0] : "Member");
          const initials = m.user_name
            ? m.user_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : email
              ? email.slice(0, 2).toUpperCase()
              : "U";
          return {
            id: m.id,
            name,
            email,
            initials,
            role: m.user_role || "employee",
            designation: m.designation || "Team Member",
            assignedTasksCount: 0,
            assignedFeaturesCount: 0,
            hoursLogged: 0,
            status: "active",
          };
        });
        setMembers(mapped);
      }
    } catch {
      // fallback to project.members
    }
  }, [project.id]);

  React.useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleRemoveMember = async (memberId: string) => {
    try {
      await api.projects.removeMember(memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      toast.success("Member removed from the project.");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove member",
      );
    }
  };

  const handleSendInvite = async (newInvite: ProjectInvite) => {
    try {
      await api.projects.addMember({
        project_id: project.id,
        email: newInvite.email,
      });
      toast.success(`Invitation email sent to ${newInvite.email}`);
      await loadMembers();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to invite member",
      );
    }
  };

  const filteredMembers = React.useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.designation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [members, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Tab Header & Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Project Team &amp; Governance
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isManager
              ? "Manage team permissions and operational designations."
              : "Everyone working on this project and their roles."}
          </p>
        </div>

        {isManager && (
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsInviteDialogOpen(true)}
            className="gap-1.5 self-start sm:self-auto text-xs font-semibold"
          >
            <Icon icon={Plus} size={15} />
            <span>Invite member</span>
          </Button>
        )}
      </div>

      {/* Team Members Table */}
      <TeamMembersTable
        members={filteredMembers}
        totalMembersCount={members.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isManager={isManager}
        onRemoveMember={handleRemoveMember}
      />

      {/* Invite Member Modal */}
      <InviteMemberDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        onSendInvite={handleSendInvite}
      />
    </div>
  );
}
