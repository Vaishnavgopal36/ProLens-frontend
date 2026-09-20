import * as React from "react";
import { X } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { MultiSelectFilter } from "./multi-select-filter";
import { PeopleFilter } from "./people-filter";
import { SearchFilter } from "./search-filter";
import type { FiltersState } from "./use-filters";

interface FilterBarProps<T> {
  filters: FiltersState<T>;
  /** Omit to hide the search box. */
  searchPlaceholder?: string;
  /** Right-aligned slot for view options or actions. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * The filter row that sits at the top of a tab: search, people, then one
 * chip per field, "Clear filters" when anything is active, and a slot on
 * the right. Fields come from useFilters, so a tab only declares its data.
 */
export function FilterBar<T>({
  filters,
  searchPlaceholder,
  children,
  className,
}: FilterBarProps<T>) {
  const { fields, selected, setValues, search, setSearch, activeCount, clear } =
    filters;
  const people = fields.filter((f) => f.kind === "people");
  const chips = fields.filter((f) => f.kind !== "people");

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {searchPlaceholder && (
          <SearchFilter
            value={search}
            onChange={setSearch}
            placeholder={searchPlaceholder}
          />
        )}

        {people.map((field) => (
          <PeopleFilter
            key={field.key}
            label={`Filter by ${field.label.toLowerCase()}`}
            options={field.options}
            value={selected[field.key] ?? []}
            onChange={(v) => setValues(field.key, v)}
          />
        ))}

        {chips.map((field) => (
          <MultiSelectFilter
            key={field.key}
            label={field.label}
            options={field.options}
            value={selected[field.key] ?? []}
            onChange={(v) => setValues(field.key, v)}
          />
        ))}

        {activeCount > 0 && (
          <button
            type="button"
            onClick={clear}
            className="flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Clear filters
            <Icon icon={X} size={12} />
          </button>
        )}
      </div>

      {children && (
        <div className="flex shrink-0 items-center gap-3">{children}</div>
      )}
    </div>
  );
}
