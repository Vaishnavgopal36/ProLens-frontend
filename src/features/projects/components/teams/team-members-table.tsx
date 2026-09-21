import * as React from "react";
import { Search, MoreHorizontal, UserMinus, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/composed/confirm-dialog";
import type { ProjectMember } from "@/types/project";

interface TeamMembersTableProps {
  members: ProjectMember[];
  totalMembersCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isManager: boolean;
  onRemoveMember: (memberId: string) => void;
}

export function TeamMembersTable({
  members,
  totalMembersCount,
  searchQuery,
  onSearchChange,
  isManager,
  onRemoveMember,
}: TeamMembersTableProps) {
  const [pendingRemoval, setPendingRemoval] =
    React.useState<ProjectMember | null>(null);

  return (
    <div className="space-y-3">
      {/* Controls Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">
            Active Team Members
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-3xs font-bold text-muted-foreground">
            {totalMembersCount}
          </span>
        </div>

        <div className="relative w-full sm:w-64">
          <Icon
            icon={Search}
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Filter members..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 pl-8 pr-7 text-xs bg-canvas-surface"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <Icon icon={X} size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Members Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[280px]">Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Assignments</TableHead>
            <TableHead className="text-right">Hours Logged</TableHead>
            <TableHead className="text-center">Status</TableHead>
            {isManager && (
              <TableHead className="w-[50px] text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id} className="hover:bg-canvas-overlay/40">
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                    <AvatarFallback className="text-3xs font-bold bg-navy-500 text-white dark:bg-foreground dark:text-background">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground leading-none">
                      {member.name}
                    </p>
                    <p className="text-2xs text-muted-foreground leading-none">
                      {member.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-xs font-medium capitalize text-foreground">
                  {member.role}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground">
                  {member.designation}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground">
                  {member.assignedTasksCount} tasks •{" "}
                  {member.assignedFeaturesCount} features
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 tabular-nums">
                  {member.hoursLogged.toFixed(1)}h
                </span>
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant="outline"
                  className="text-3xs uppercase font-bold text-teal-600 bg-teal-500/10 border-teal-500/30 dark:text-teal-400 px-2 py-0.5"
                >
                  {member.status}
                </Badge>
              </TableCell>
              {isManager && (
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={`Actions for ${member.name}`}
                      >
                        <Icon icon={MoreHorizontal} size={15} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setPendingRemoval(member)}
                        className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive"
                      >
                        <Icon icon={UserMinus} size={13} />
                        <span>Remove from project</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Footer Context */}
      <div className="flex items-center justify-between text-2xs text-muted-foreground px-1 pt-1">
        <span>Showing {members.length} active members</span>
        <span>Page 1 of 1</span>
      </div>

      <ConfirmDialog
        open={pendingRemoval !== null}
        onOpenChange={(open) => !open && setPendingRemoval(null)}
        title="Remove team member"
        description={
          <>
            Remove <strong>{pendingRemoval?.name}</strong> from this project?
            They'll lose access immediately and their assigned tasks and
            features will need to be reassigned.
          </>
        }
        confirmLabel="Remove"
        onConfirm={() => {
          if (pendingRemoval) onRemoveMember(pendingRemoval.id);
        }}
      />
    </div>
  );
}
