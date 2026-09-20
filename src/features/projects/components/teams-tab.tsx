import * as React from "react";
import { Plus } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { Project } from "@/types/project";
import { TeamMembersTable } from "./teams/team-members-table";
import { InviteMemberDialog } from "./teams/invite-member-dialog";
import { toast } from "sonner";

interface TeamsTabProps {
  project: Project;
  selectedMemberId: string | null;
}

export function TeamsTab({ project, selectedMemberId }: TeamsTabProps) {
  const { hasMinimumRole } = usePermissions();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = React.useState(false);
  const [members, setMembers] = React.useState(project.members);

  // Reset the local roster if the user navigates to a different project
  // without unmounting this tab (same route, different :projectId).
  React.useEffect(() => {
    setMembers(project.members);
  }, [project.id, project.members]);

  const isManager = hasMinimumRole("manager");

  const handleRemoveMember = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    if (member) toast.success(`${member.name} removed from the project.`);
  };

  const filteredMembers = React.useMemo(() => {
    return members.filter((member) => {
      const matchesQuickFilter =
        !selectedMemberId || member.id === selectedMemberId;
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.designation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesQuickFilter && matchesSearch;
    });
  }, [members, selectedMemberId, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Tab Header & Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Project Team &amp; Governance
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage team permissions and operational designations.
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
        onSendInvite={() => {}}
      />
    </div>
  );
}
