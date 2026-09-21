import * as React from "react";
import { MoreHorizontal, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { FilterBar, useFilters } from "@/components/composed/filters";
import type { FilterFieldDef } from "@/components/composed/filters";
import {
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/composed/skeletons";
import { useAuth } from "@/app/providers";
import { useSimulatedLoading } from "@/lib/use-simulated-loading";
import { cn } from "@/lib/utils";
import { MOCK_USERS, type DirectoryUser } from "../api/mock-data";

const ROLE_LABELS: Record<string, string> = {
  employee: "Employee",
  manager: "Manager",
  admin: "Admin",
  super_admin: "Super admin",
};

export function UserDirectoryPage() {
  const isLoading = useSimulatedLoading();
  const { user: me } = useAuth();
  const [users, setUsers] = React.useState<DirectoryUser[]>(MOCK_USERS);
  const [pending, setPending] = React.useState<DirectoryUser | null>(null);

  const fields = React.useMemo<FilterFieldDef<DirectoryUser>[]>(
    () => [
      {
        key: "role",
        label: "Role",
        options: ["employee", "manager", "admin"].map((r) => ({
          value: r,
          label: ROLE_LABELS[r],
        })),
        accessor: (u) => u.role,
      },
      {
        key: "status",
        label: "Status",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
        accessor: (u) => u.status,
      },
      {
        key: "project",
        label: "Project",
        options: [...new Set(MOCK_USERS.flatMap((u) => u.projects))].map(
          (p) => ({ value: p, label: p }),
        ),
        accessor: (u) => u.projects,
      },
    ],
    [],
  );
  const filters = useFilters(users, fields, (u) =>
    [u.name, u.email, u.designation].join(" "),
  );

  const setStatus = (id: string, status: DirectoryUser["status"]) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <TableSkeleton columns={6} rows={6} />
      </div>
    );
  }

  const shown = filters.filtered;
  const deactivating = pending?.status === "active";

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs text-muted-foreground">Workspace / Users</span>
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">
          User directory
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Everyone in your organization, their role and the projects they work
          on
        </p>
      </div>

      <FilterBar filters={filters} searchPlaceholder="Search people..." />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[280px]">User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Projects</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="w-[50px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shown.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-10 text-center text-xs text-muted-foreground"
              >
                No users match these filters.
              </TableCell>
            </TableRow>
          )}
          {shown.map((u) => {
            const isSelf = u.email === me?.email;
            const active = u.status === "active";
            return (
              <TableRow key={u.id} className="hover:bg-canvas-overlay/40">
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.avatarUrl} alt={u.name} />
                      <AvatarFallback className="bg-navy-500 text-3xs font-bold text-white dark:bg-foreground dark:text-background">
                        {u.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold leading-none text-foreground">
                        {u.name}
                      </p>
                      <p className="text-2xs leading-none text-muted-foreground">
                        {u.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-medium text-foreground">
                  {ROLE_LABELS[u.role] ?? u.role}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {u.designation}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {u.projects.length === 0
                    ? "—"
                    : u.projects.length <= 2
                      ? u.projects.join(", ")
                      : `${u.projects.slice(0, 2).join(", ")} +${u.projects.length - 2}`}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-2 py-0.5 text-3xs font-bold uppercase",
                      active
                        ? "border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-400"
                        : "text-muted-foreground",
                    )}
                  >
                    {u.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {!isSelf && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                          aria-label={`Actions for ${u.name}`}
                        >
                          <Icon icon={MoreHorizontal} size={15} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setPending(u)}
                          className={cn(
                            "cursor-pointer gap-2 text-xs",
                            active && "text-destructive focus:text-destructive",
                          )}
                        >
                          <Icon icon={active ? UserX : UserCheck} size={13} />
                          <span>{active ? "Deactivate" : "Reactivate"}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <p className="px-1 text-2xs text-muted-foreground">
        Showing {shown.length} of {users.length} users
      </p>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title={deactivating ? "Deactivate user" : "Reactivate user"}
        variant={deactivating ? "destructive" : "default"}
        description={
          deactivating ? (
            <>
              Deactivate <strong>{pending?.name}</strong>? They'll be signed out
              and lose access until you reactivate them.
            </>
          ) : (
            <>
              Restore access for <strong>{pending?.name}</strong>?
            </>
          )
        }
        confirmLabel={deactivating ? "Deactivate" : "Reactivate"}
        onConfirm={() => {
          if (!pending) return;
          setStatus(pending.id, deactivating ? "inactive" : "active");
          toast.success(
            `${pending.name} ${deactivating ? "deactivated" : "reactivated"}.`,
          );
        }}
      />
    </div>
  );
}
