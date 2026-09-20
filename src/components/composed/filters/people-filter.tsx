import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { FilterOption } from "./types";

interface PeopleFilterProps {
  label?: string;
  options: FilterOption[];
  value: string[];
  onChange: (value: string[]) => void;
  /** false = selecting one person replaces the previous selection. */
  multiple?: boolean;
}

/** Overlapping avatars you click to filter by person; several can be on. */
export function PeopleFilter({
  label = "Filter by person",
  options,
  value,
  onChange,
  multiple = true,
}: PeopleFilterProps) {
  const toggle = (v: string) => {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange(multiple ? [...value, v] : [v]);
  };

  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center -space-x-1.5 px-1 py-1"
    >
      {options.map((person) => {
        const on = value.includes(person.value);
        return (
          <button
            key={person.value}
            type="button"
            aria-pressed={on}
            title={person.label}
            onClick={() => toggle(person.value)}
            className={cn(
              "relative shrink-0 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              on
                ? "z-20 scale-110 ring-2 ring-teal-500 ring-offset-2 ring-offset-canvas-surface"
                : "z-0 opacity-80 hover:z-10 hover:scale-105 hover:opacity-100",
            )}
          >
            <Avatar className="h-7 w-7 border-2 border-canvas-surface">
              <AvatarImage src={person.avatarUrl} alt={person.label} />
              <AvatarFallback className="bg-navy-500 text-3xs font-bold text-white dark:bg-foreground dark:text-background">
                {person.initials ?? person.label.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>
        );
      })}
    </div>
  );
}
