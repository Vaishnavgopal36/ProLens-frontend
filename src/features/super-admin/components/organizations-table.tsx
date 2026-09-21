import * as React from "react";
import {
  Search,
  MoreHorizontal,
  Eye,
  Ban,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ConfirmDialog } from "@/components/composed/confirm-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Organization, OrganizationStatus } from "../api/types";

interface OrganizationsTableProps {
  organizations: Organization[];
  onToggleStatus: (orgId: string, nextStatus: OrganizationStatus) => void;
  onViewTenant: (orgId: string) => void;
}

type StatusFilter = "all" | OrganizationStatus;

export function OrganizationsTable({
  organizations,
  onToggleStatus,
  onViewTenant,
}: OrganizationsTableProps) {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [pendingToggle, setPendingToggle] = React.useState<Organization | null>(
    null,
  );

  const filtered = organizations.filter((org) => {
    const matchesQuery =
      !query.trim() ||
      org.name.toLowerCase().includes(query.trim().toLowerCase()) ||
      org.slug.toLowerCase().includes(query.trim().toLowerCase());
    const matchesStatus = statusFilter === "all" || org.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const isSuspending = pendingToggle?.status === "active";
  const hasActiveFilters = query.trim().length > 0 || statusFilter !== "all";
  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Icon
            icon={Search}
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search by name or slug…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 pl-8 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className="h-9 w-full sm:w-40 text-xs font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex shrink-0 items-center gap-1 rounded-full border border-border-subtle bg-canvas-surface px-2 py-1 text-2xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-canvas-overlay"
            >
              <span>Clear filters</span>
              <Icon icon={X} size={11} />
            </button>
          )}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organization</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead>Primary contact</TableHead>
            <TableHead className="text-center">Active projects</TableHead>
            <TableHead className="text-center">Members</TableHead>
            <TableHead className="text-center">Created</TableHead>
            <TableHead className="w-[60px] text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((org) => (
            <TableRow key={org.id}>
              <TableCell>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground leading-none">
                    {org.name}
                  </p>
                  <p className="text-2xs text-muted-foreground leading-none tabular-nums">
                    /{org.slug}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-3xs uppercase font-bold px-2 py-0.5",
                    org.status === "active"
                      ? "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800"
                      : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
                  )}
                >
                  {org.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="space-y-0.5">
                  <p className="text-xs text-foreground leading-none">
                    {org.primaryContact.name}
                  </p>
                  <p className="text-2xs text-muted-foreground leading-none">
                    {org.primaryContact.email}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-center text-xs tabular-nums font-medium">
                {org.activeProjects}
              </TableCell>
              <TableCell className="text-center text-xs tabular-nums font-medium">
                {org.totalMembers}
              </TableCell>
              <TableCell className="text-center text-xs text-muted-foreground whitespace-nowrap">
                {org.createdAt}
              </TableCell>
              <TableCell className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 mx-auto"
                      aria-label={`Actions for ${org.name}`}
                    >
                      <Icon icon={MoreHorizontal} size={15} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewTenant(org.id)}>
                      <Icon icon={Eye} size={13} className="mr-2" />
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={
                        org.status === "active"
                          ? "text-destructive focus:text-destructive"
                          : undefined
                      }
                      onClick={() => setPendingToggle(org)}
                    >
                      <Icon
                        icon={org.status === "active" ? Ban : CheckCircle2}
                        size={13}
                        className="mr-2"
                      />
                      {org.status === "active" ? "Suspend" : "Activate"} tenant
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-xs text-muted-foreground py-8"
              >
                No organizations match your search.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={pendingToggle !== null}
        onOpenChange={(open) => !open && setPendingToggle(null)}
        title={isSuspending ? "Suspend organization" : "Activate organization"}
        description={
          isSuspending ? (
            <>
              Suspending <strong>{pendingToggle?.name}</strong> immediately
              revokes access for all its members. This can be reversed later.
            </>
          ) : (
            <>
              Reactivating <strong>{pendingToggle?.name}</strong> restores
              access for all its members.
            </>
          )
        }
        confirmLabel={isSuspending ? "Suspend" : "Activate"}
        variant={isSuspending ? "destructive" : "default"}
        onConfirm={() => {
          if (!pendingToggle) return;
          const next: OrganizationStatus = isSuspending
            ? "suspended"
            : "active";
          onToggleStatus(pendingToggle.id, next);
          toast.success(
            `${pendingToggle.name} ${next === "suspended" ? "suspended" : "activated"}`,
          );
        }}
      />
    </div>
  );
}
