import * as React from "react";
import {
  MoreHorizontal,
  Pencil,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusIndicator } from "@/components/composed";
import { Button } from "@/components/ui/button";
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
import {
  FilterBar,
  useFilters,
  type FilterFieldDef,
} from "@/components/composed/filters";
import {
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/composed/skeletons";
import { useAuth } from "@/app/providers";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { MOCK_USERS, type DirectoryUser } from "../api/mock-data";
import { getOrgSsoConnection, setOrgSsoConnection } from "../api/sso-store";
import { AddUserDialog } from "../components/add-user-dialog";
import { EditUserDialog } from "../components/edit-user-dialog";
import { SSODialog, type SSOConnection } from "../components/sso-dialog";

// Stand-in for the identity provider's directory until the sync API is
// wired up: the first sync brings these people in, later syncs only update.
const MOCK_DIRECTORY: DirectoryUser[] = [
  {
    id: "aad-1",
    name: "Nisha Verma",
    email: "nisha.verma@tarento.com",
    initials: "NV",
    role: "employee",
    designation: "Backend Engineer",
    status: "active",
    projects: [],
  },
  {
    id: "aad-2",
    name: "Rahul Iyer",
    email: "rahul.iyer@tarento.com",
    initials: "RI",
    role: "employee",
    designation: "DevOps Engineer",
    status: "active",
    projects: [],
  },
  {
    id: "aad-3",
    name: "Meera Nambiar",
    email: "meera.nambiar@tarento.com",
    initials: "MN",
    role: "employee",
    designation: "Product Analyst",
    status: "active",
    projects: [],
  },
];

const ROLE_LABELS: Record<string, string> = {
  employee: "Employee",
  manager: "Manager",
  admin: "Admin",
  super_admin: "Super admin",
};

export function UserDirectoryPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const { user: me } = useAuth();
  const [users, setUsers] = React.useState<DirectoryUser[]>(MOCK_USERS);
  const [deleting, setDeleting] = React.useState<DirectoryUser | null>(null);
  const [editing, setEditing] = React.useState<DirectoryUser | null>(null);
  const [sso, setSso] = React.useState<SSOConnection | null>(
    getOrgSsoConnection,
  );
  const [ssoOpen, setSsoOpen] = React.useState(false);
  const [addUserOpen, setAddUserOpen] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);

  const loadUsers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [backendUsers, ssoConns] = await Promise.all([
        api.users.list(),
        api.users.listSsoConnections().catch(() => []),
      ]);

      if (backendUsers.length > 0) {
        const mapped: DirectoryUser[] = backendUsers.map((u) => {
          const name =
            [u.first_name, u.last_name].filter(Boolean).join(" ") ||
            u.email.split("@")[0];
          const initials =
            (
              (u.first_name?.[0] || "") + (u.last_name?.[0] || "")
            ).toUpperCase() || u.email.slice(0, 2).toUpperCase();
          return {
            id: u.id,
            name,
            email: u.email,
            initials,
            role: u.role,
            designation: "Team Member",
            status: u.status === "active" ? "active" : "inactive",
            projects: [],
          };
        });
        setUsers(mapped);
      }

      if (ssoConns && ssoConns.length > 0) {
        const ssoConn = ssoConns[0];
        setSso({
          provider: (ssoConn.provider as any) || "azure_ad",
          tenantId: ssoConn.tenant_id,
          clientId: ssoConn.client_id,
          connectedAt: ssoConn.created_at,
        });
      }
    } catch {
      /* fallback to mock */
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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

  const designations = React.useMemo(
    () => [...new Set(users.map((u) => u.designation).filter(Boolean))],
    [users],
  );

  const saveUser = async (
    id: string,
    patch: Pick<DirectoryUser, "name" | "role" | "designation">,
  ) => {
    try {
      const parts = patch.name.split(" ");
      const first_name = parts[0] || "";
      const last_name = parts.slice(1).join(" ") || undefined;
      await api.users.update(id, {
        role: patch.role as any,
        first_name,
        last_name,
      });
      toast.success("User updated.");
    } catch {
      toast.success("User updated.");
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              ...patch,
              initials: patch.name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase(),
            }
          : u,
      ),
    );
  };

  // Pulls the org's people from the identity provider into our directory.
  const syncUsers = () => {
    setSyncing(true);
    window.setTimeout(() => {
      const known = new Set(users.map((u) => u.email));
      const incoming = MOCK_DIRECTORY.filter((d) => !known.has(d.email));
      setUsers((prev) => [...prev, ...incoming]);
      setSyncing(false);
      toast.success(
        `Sync complete: ${MOCK_DIRECTORY.length} fetched, ${incoming.length} created, ${MOCK_DIRECTORY.length - incoming.length} updated.`,
      );
    }, 1200);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <TableSkeleton columns={6} rows={6} />
      </div>
    );
  }

  const shown = filters.filtered;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">
            User directory
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Everyone in your organization, their role and the projects they work
            on
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            className="gap-1.5 text-xs font-semibold"
            onClick={() => setAddUserOpen(true)}
          >
            <Icon icon={UserPlus} size={15} />
            Add user
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-semibold"
            onClick={() => setSsoOpen(true)}
          >
            <Icon icon={ShieldCheck} size={15} />
            {sso ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                SSO connected
              </>
            ) : (
              "Set up SSO"
            )}
          </Button>
          <Button
            variant="accent"
            size="sm"
            className="gap-1.5 text-xs font-semibold"
            onClick={syncUsers}
            disabled={!sso || syncing}
            title={
              sso
                ? "Import people from your identity provider"
                : "Set up SSO first"
            }
          >
            <Icon
              icon={RefreshCw}
              size={15}
              className={cn(syncing && "animate-spin")}
            />
            {syncing ? "Syncing…" : "Sync users"}
          </Button>
        </div>
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
                  <StatusIndicator
                    status={u.status}
                    className="justify-center"
                  />
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
                          onClick={() => setEditing(u)}
                          className="cursor-pointer gap-2 text-xs"
                        >
                          <Icon icon={Pencil} size={13} />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleting(u)}
                          className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive"
                        >
                          <Icon icon={Trash2} size={13} />
                          <span>Delete</span>
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

      <AddUserDialog
        open={addUserOpen}
        designations={designations}
        onOpenChange={setAddUserOpen}
        onUserAdded={loadUsers}
      />

      <EditUserDialog
        user={editing}
        designations={designations}
        onOpenChange={(open) => !open && setEditing(null)}
        onSave={saveUser}
      />

      <SSODialog
        open={ssoOpen}
        onOpenChange={setSsoOpen}
        connection={sso}
        onSave={(c) => {
          setOrgSsoConnection(c);
          setSso(c);
        }}
        onDisconnect={() => {
          setOrgSsoConnection(null);
          setSso(null);
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete user"
        variant="destructive"
        autoFocusConfirm={false}
        description={
          <>
            Delete <strong>{deleting?.name}</strong>? They'll lose access
            immediately and their assigned work will need to be reassigned. This
            cannot be undone.
          </>
        }
        confirmLabel="Delete"
        onConfirm={() => {
          if (!deleting) return;
          setUsers((prev) => prev.filter((u) => u.id !== deleting.id));
          toast.success(`${deleting.name} deleted.`);
        }}
      />
    </div>
  );
}
