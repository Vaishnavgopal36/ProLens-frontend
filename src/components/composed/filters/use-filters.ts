import * as React from "react";
import type { FilterFieldDef } from "./types";

/**
 * Owns all filter state for one view and returns the filtered items.
 * A field with no selected values doesn't filter; with several selected
 * values an item matches if it has any of them (OR within a field, AND
 * across fields, like Jira).
 */
export function useFilters<T>(
  items: T[],
  fields: FilterFieldDef<T>[],
  searchText?: (item: T) => string,
) {
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<Record<string, string[]>>({});

  const setValues = React.useCallback((key: string, values: string[]) => {
    setSelected((prev) => ({ ...prev, [key]: values }));
  }, []);

  const clear = React.useCallback(() => {
    setSearch("");
    setSelected({});
  }, []);

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (
        query &&
        searchText &&
        !searchText(item).toLowerCase().includes(query)
      )
        return false;
      return fields.every((field) => {
        const values = selected[field.key];
        return !values?.length || values.includes(field.accessor(item));
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, search, selected]);

  const activeCount =
    fields.reduce((n, f) => n + (selected[f.key]?.length ?? 0), 0) +
    (search.trim() ? 1 : 0);

  return {
    fields,
    search,
    setSearch,
    selected,
    setValues,
    clear,
    activeCount,
    filtered,
  };
}

export type FiltersState<T = unknown> = ReturnType<typeof useFilters<T>>;
