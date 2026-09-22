import * as React from "react";
import { Plus } from "lucide-react";
import { KpiCard } from "@/components/composed";
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

const PLATFORM_KPIS = [
  {
    key: "totalOrganizations",
    label: "Active organizations",
    getValue: () => MOCK_PLATFORM_METRICS.totalOrganizations,
    trend: {
      value: "+2",
      direction: "up" as const,
      timeframe: "vs last quarter",
      isPositive: true,
    },
    sparkline: [8, 9, 10, 10, 11, 12],
  },
  {
    key: "totalUsers",
    label: "Total platform users",
    getValue: () => MOCK_PLATFORM_METRICS.totalUsers.toLocaleString(),
    trend: {
      value: "+18",
      direction: "up" as const,
      timeframe: "vs last month",
      isPositive: true,
    },
    sparkline: [112, 120, 128, 135, 142, 148],
  },
  {
    key: "activeProjects",
    label: "Active projects",
    getValue: () => MOCK_PLATFORM_METRICS.activeProjects,
    trend: {
      value: "+5",
      direction: "up" as const,
      timeframe: "vs last month",
      isPositive: true,
    },
    sparkline: [24, 27, 29, 31, 32, 34],
  },
  {
    key: "totalHoursLogged",
    label: "System-wide hours logged",
    getValue: () => `${MOCK_PLATFORM_METRICS.totalHoursLogged.toFixed(1)}h`,
    trend: {
      value: "+8.6%",
      direction: "up" as const,
      timeframe: "vs previous period",
      isPositive: true,
    },
    sparkline: [4100, 4320, 4580, 4810, 5100, 5280.5],
  },
];

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
        {PLATFORM_KPIS.map((kpi) => (
          <KpiCard
            key={kpi.key}
            label={kpi.label}
            value={kpi.getValue()}
            trend={kpi.trend}
            sparklineData={kpi.sparkline}
          />
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
