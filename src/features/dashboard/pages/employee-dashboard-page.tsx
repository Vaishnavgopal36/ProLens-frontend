import * as React from "react";
import { useModalHotkey } from "@/hooks/use-hotkey";
import { Plus } from "lucide-react";
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
  EMPLOYEE_METRICS,
  EMPLOYEE_PRIORITIES_TABLE,
  EMPLOYEE_WEEKLY_EFFORT,
} from "../api/mock-data";
import { MetricCard } from "../components/metric-card";
import { UpcomingActivities } from "../components/upcoming-activities";
import { LogTimeDialog } from "../components/log-time-dialog";

export function EmployeeDashboardPage() {
  const [logTimeOpen, setLogTimeOpen] = React.useState(false);

  useModalHotkey({
    open: logTimeOpen,
    onOpen: () => setLogTimeOpen(true),
    onClose: () => setLogTimeOpen(false),
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs text-muted-foreground">
            Workspace / My overview
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
            Good morning, Elena
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            You have 2 tasks due in the next 48 hours.
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() => setLogTimeOpen(true)}
          className="gap-1.5 font-semibold self-start sm:self-auto"
        >
          <Icon icon={Plus} size={15} />
          <span>Log time</span>
        </Button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {EMPLOYEE_METRICS.map((metric) => (
          <MetricCard key={metric.id} data={metric} />
        ))}
      </div>

      {/* Middle 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left: Priorities Table Card */}
        <Card className="lg:col-span-2 p-5 border-border-subtle bg-canvas-surface flex flex-col h-[380px]">
          <div className="flex items-center justify-between pb-3 shrink-0">
            <h2 className="text-sm font-semibold text-foreground">
              My active priorities
            </h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-3xs font-bold text-muted-foreground">
              {EMPLOYEE_PRIORITIES_TABLE.length} assigned
            </span>
          </div>

          {/* Scrollable Container targeting the UI table inner wrapper */}
          <div className="flex-1 min-h-0 overflow-y-auto [&>div]:max-h-[290px] [&>div]:overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-canvas-surface z-10">
                <TableRow>
                  <TableHead className="w-[100px] bg-canvas-surface">
                    Priority
                  </TableHead>
                  <TableHead className="bg-canvas-surface">
                    Task title
                  </TableHead>
                  <TableHead className="bg-canvas-surface">Project</TableHead>
                  <TableHead className="bg-canvas-surface">Due date</TableHead>
                  <TableHead className="text-right bg-canvas-surface">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {EMPLOYEE_PRIORITIES_TABLE.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Badge
                        variant={
                          row.priority === "Urgent"
                            ? "destructive"
                            : row.priority === "High"
                              ? "accent"
                              : "neutral"
                        }
                        className="text-3xs uppercase font-bold px-2 py-0.5"
                      >
                        {row.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground">
                      {row.title}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {row.project}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {row.dueDate}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          row.status === "In progress" ? "secondary" : "outline"
                        }
                        className="text-3xs uppercase font-semibold px-2 py-0.5"
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Right: Weekly Effort Logged Card */}
        <Card className="p-5 border-border-subtle bg-canvas-surface flex flex-col h-[380px] justify-between">
          <div className="space-y-3 pb-3 shrink-0 border-b border-border-subtle">
            <h3 className="text-sm font-semibold text-foreground">
              Weekly effort logged
            </h3>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>
                  {EMPLOYEE_WEEKLY_EFFORT.totalHours} /{" "}
                  {EMPLOYEE_WEEKLY_EFFORT.targetHours} hours
                </span>
                <span className="text-teal-600 dark:text-teal-400">
                  {EMPLOYEE_WEEKLY_EFFORT.percentage}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full"
                  style={{ width: `${EMPLOYEE_WEEKLY_EFFORT.percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Scrollable list with max-height constraint */}
          <div className="flex-1 min-h-0 overflow-y-auto max-h-[190px] divide-y divide-border-subtle pr-1 my-2">
            {EMPLOYEE_WEEKLY_EFFORT.breakdown.map((item) => (
              <div
                key={item.day}
                className="flex items-center justify-between py-2 text-xs"
              >
                <span className="text-muted-foreground">{item.day}</span>
                <span className="tabular-nums font-medium text-foreground">
                  {item.hours.toFixed(1)}h
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-border-subtle shrink-0">
            <button
              type="button"
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline block"
            >
              View full timesheet →
            </button>
          </div>
        </Card>
      </div>

      <UpcomingActivities />
      <LogTimeDialog open={logTimeOpen} onOpenChange={setLogTimeOpen} />
    </div>
  );
}
