import * as React from "react";
import { Plus, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
  ADMIN_METRICS,
  ADMIN_PROJECTS_TABLE,
  ADMIN_TEAM_DISTRIBUTION,
} from "../api/mock-data";
import { MetricCard } from "../components/metric-card";
import { UpcomingActivities } from "../components/upcoming-activities";
import { useSimulatedLoading } from "@/lib/use-simulated-loading";
import {
  PageHeaderSkeleton,
  MetricCardGridSkeleton,
  TableSkeleton,
  CardListSkeleton,
} from "@/components/composed/skeletons";

export function AdminDashboardPage() {
  const isLoading = useSimulatedLoading();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton withAction />
        <MetricCardGridSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <TableSkeleton columns={6} rows={5} />
          </div>
          <CardListSkeleton rows={4} />
        </div>
        <CardListSkeleton rows={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs text-muted-foreground">
            Organization / Overview
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
            Executive overview
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Company-wide project health and resource allocation
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          className="gap-1.5 font-semibold self-start sm:self-auto"
        >
          <Icon icon={Plus} size={15} />
          <span>New project</span>
        </Button>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ADMIN_METRICS.map((metric) => (
          <MetricCard key={metric.id} data={metric} />
        ))}
      </div>

      {/* Middle 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Active projects table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                All active projects
              </h2>
              <p className="text-xs text-muted-foreground">
                Monitored progress, resource loads, and milestones
              </p>
            </div>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
              5 showing
            </span>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Hours logged</TableHead>
                <TableHead className="w-[70px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ADMIN_PROJECTS_TABLE.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground leading-none">
                        {row.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-none">
                        {row.subname}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.client}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.manager}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row.status === "Active"
                          ? "success"
                          : row.status === "On-hold"
                          ? "warning"
                          : "destructive"
                      }
                      className="text-[10px] uppercase font-bold px-2 py-0.5"
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs font-mono font-medium">
                    {row.hoursLogged.toFixed(1)}h
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      View
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
            <span>Showing 5 of 14 projects</span>
            <div className="flex gap-2">
              <button type="button" className="hover:text-foreground">Previous</button>
              <span>•</span>
              <button type="button" className="hover:text-foreground">Next</button>
            </div>
          </div>
        </div>

        {/* Right (1 col): Team Distribution */}
        <div className="space-y-3">
          <Card className="p-5 border-border-subtle bg-canvas-surface space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Team distribution
              </h3>
              <Icon icon={Users} size={15} className="text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              Resource allocation across active units
            </p>

            <div className="divide-y divide-border-subtle">
              {ADMIN_TEAM_DISTRIBUTION.map((team, idx) => (
                <div key={idx} className="py-2.5 first:pt-0 last:pb-0 space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">
                    {team.department}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {team.details}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-border-subtle bg-canvas-bg/50 p-3 flex items-start gap-2.5">
              <Icon icon={CheckCircle2} size={15} className="text-teal-500 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <p className="font-semibold text-foreground">
                  Target capacity nominal
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Overall 84% capacity is allocated across units.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline pt-1 block"
            >
              Manage user directory →
            </button>
          </Card>
        </div>
      </div>

      {/* Bottom scheduled activities */}
      <UpcomingActivities />
    </div>
  );
}