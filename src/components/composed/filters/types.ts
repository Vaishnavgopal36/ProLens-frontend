export interface FilterOption {
  value: string;
  label: string;
  /** Shown in the avatar for "people" fields. */
  initials?: string;
  avatarUrl?: string;
}

export interface FilterFieldDef<T> {
  /** Stable id, also the key in the selected-values map. */
  key: string;
  label: string;
  /** "multi" renders a checkbox dropdown; "people" renders avatar toggles. */
  kind?: "multi" | "people";
  options: FilterOption[];
  /** Reads the value this field filters on from an item. */
  accessor: (item: T) => string;
}
