import * as React from "react";
import { cn } from "@/lib/utils";
import { FilterDropdown } from "./filter-dropdown";
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
 * The filter row that sits at the top of a tab: search, people quick-toggles,
 * one unified Filter dropdown for every field (with its own "Clear filters"),
 * and a slot on the right. Fields come from useFilters, so a tab only declares its data.
 */
export function FilterBar<T>({
  filters,
  searchPlaceholder,
  children,
  className,
}: FilterBarProps<T>) {
  const { fields, selected, setValues, search, setSearch } = filters;
  const people = fields.filter((f) => f.kind === "people");

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

        <FilterDropdown filters={filters} />
      </div>

      {children && (
        <div className="flex shrink-0 items-center gap-3">{children}</div>
      )}
    </div>
  );
}
