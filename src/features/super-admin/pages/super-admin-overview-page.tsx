import * as React from "react";
import { Plus, Building2, Users, FolderKanban, Clock3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useSimulatedLoading } from "@/lib/use-simulated-loading";
import {
  PageHeaderSkeleton,
  MetricCardGridSkeleton,
  CardListSkeleton,
} from "@/components/composed/skeletons";
import { MOCK_PLATFORM_METRICS, MOCK_AUDIT_LOG } from "../api/mock-data";
import { AuditTrailList } from "../components/audit-trail-list";
import { ProvisionOrganizationSheet } from "../components/provision-organization-sheet";
import type { ProvisionOrganizationInput } from "../api/types";

const KPI_CARDS = [
  {
    key: "totalOrganizations",
    label: "Active organizations",
    icon: Building2,
  },
  { key: "totalUsers", label: "Total platform users", icon: Users },
  { key: "activeProjects", label: "Active projects", icon: FolderKanban },
  {
    key: "totalHoursLogged",
    label: "System-wide hours logged",
    icon: Clock3,
  },
] as const;

export function SuperAdminOverviewPage() {
  const isLoading = useSimulatedLoading();
  const [provisionOpen, setProvisionOpen] = React.useState(false);

  const handleProvision = (input: ProvisionOrganizationInput) => {
    // No backend yet — provisioning is wired at the api layer once the
    // platform-admin endpoints exist. Confirmation is handled by the sheet.
    console.info("Provision organization requested", input);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton withAction />
        <MetricCardGridSkeleton count={4} />
        <CardListSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
            Super admin overview
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Platform-wide tenant health and activity
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi) => (
          <Card
            key={kpi.key}
            className="p-4 sm:p-5 border-border-subtle bg-canvas-surface"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {kpi.label}
              </span>
              <Icon
                icon={kpi.icon}
                size={15}
                className="text-muted-foreground"
              />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {kpi.key === "totalHoursLogged"
                ? `${MOCK_PLATFORM_METRICS[kpi.key].toFixed(1)}h`
                : MOCK_PLATFORM_METRICS[kpi.key].toLocaleString()}
            </p>
          </Card>
        ))}
      </div>

      <AuditTrailList entries={MOCK_AUDIT_LOG} />

      <ProvisionOrganizationSheet
        open={provisionOpen}
        onOpenChange={setProvisionOpen}
        onProvision={handleProvision}
      />
    </div>
  );
}
