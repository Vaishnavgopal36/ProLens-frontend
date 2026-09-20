import * as React from "react";
import { useAuth } from "@/app/providers";
import { usePermissions } from "@/hooks/use-permissions";
import type {
  FilterFieldDef,
  FilterOption,
} from "@/components/composed/filters";
import type { Project } from "@/types/project";

/**
 * Who a project view is scoped to.
 *
 * Employees only ever see work assigned to them, so they get no people filter
 * and the tab narrows its data to their own name. Managers and above get the
 * project's members as a people filter.
 */
export function useProjectViewer<T>(
  project: Project,
  assigneeOf: (item: T) => string,
) {
  const { user } = useAuth();
  const { isEmployee } = usePermissions();

  const people = React.useMemo<FilterOption[]>(
    () =>
      project.members.map((m) => ({
        value: m.name,
        label: m.name,
        initials: m.initials,
        avatarUrl: m.avatarUrl,
      })),
    [project.members],
  );

  const peopleField: FilterFieldDef<T>[] = isEmployee
    ? []
    : [
        {
          key: "assignee",
          label: "Assignee",
          kind: "people",
          options: people,
          accessor: assigneeOf,
        },
      ];

  /** Employees: only their own items. Everyone else: everything. */
  const scope = React.useCallback(
    (items: T[]) =>
      isEmployee ? items.filter((i) => assigneeOf(i) === user?.name) : items,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isEmployee, user?.name],
  );

  return { isEmployee, peopleField, scope };
}
