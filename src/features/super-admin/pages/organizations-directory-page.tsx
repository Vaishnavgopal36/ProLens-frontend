import * as React from "react";
import { toLocalISODate } from "@/lib/date";
import { useModalHotkey } from "@/hooks/use-hotkey";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useSimulatedLoading } from "@/lib/use-simulated-loading";
import {
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/composed/skeletons";
import { MOCK_ORGANIZATIONS, getTenantDetail } from "../api/mock-data";
import { OrganizationsTable } from "../components/organizations-table";
import { ProvisionOrganizationSheet } from "../components/provision-organization-sheet";
import { TenantInspectorDrawer } from "../components/tenant-inspector-drawer";
import type {
  Organization,
  OrganizationStatus,
  ProvisionOrganizationInput,
} from "../api/types";

export function OrganizationsDirectoryPage() {
  const isLoading = useSimulatedLoading();
  const [organizations, setOrganizations] =
    React.useState<Organization[]>(MOCK_ORGANIZATIONS);
  const [provisionOpen, setProvisionOpen] = React.useState(false);

  // Ctrl/⌘ + K toggles "new organization".
  useModalHotkey({
    open: provisionOpen,
    onOpen: () => setProvisionOpen(true),
    onClose: () => setProvisionOpen(false),
  });
  const [inspectedOrgId, setInspectedOrgId] = React.useState<string | null>(
    null,
  );

  const handleToggleStatus = (
    orgId: string,
    nextStatus: OrganizationStatus,
  ) => {
    setOrganizations((prev) =>
      prev.map((org) =>
        org.id === orgId ? { ...org, status: nextStatus } : org,
      ),
    );
  };

  const handleProvision = (input: ProvisionOrganizationInput) => {
    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name: input.name,
      slug: input.slug,
      status: "active",
      primaryContact: {
        name: input.primaryAdminName,
        email: input.primaryAdminEmail,
      },
      activeProjects: 0,
      totalMembers: 1,
      createdAt: toLocalISODate(),
    };
    setOrganizations((prev) => [newOrg, ...prev]);
  };

  const inspectedTenant = inspectedOrgId
    ? getTenantDetail(inspectedOrgId)
    : undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton withAction />
        <TableSkeleton columns={7} rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
            Organizations directory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage tenant access, status, and provisioning
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          className="gap-1.5 font-semibold self-start sm:self-auto"
          onClick={() => setProvisionOpen(true)}
        >
          <Icon icon={Plus} size={15} />
          <span>New organization</span>
        </Button>
      </div>

      <OrganizationsTable
        organizations={organizations}
        onToggleStatus={handleToggleStatus}
        onViewTenant={setInspectedOrgId}
      />

      <ProvisionOrganizationSheet
        open={provisionOpen}
        onOpenChange={setProvisionOpen}
        onProvision={handleProvision}
      />

      <TenantInspectorDrawer
        open={inspectedOrgId !== null}
        onOpenChange={(open) => !open && setInspectedOrgId(null)}
        tenant={inspectedTenant}
      />
    </div>
  );
}
