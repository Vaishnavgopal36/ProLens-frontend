import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { FilterOption } from "./types";

interface MultiSelectFilterProps {
  label: string;
  options: FilterOption[];
  value: string[];
  onChange: (value: string[]) => void;
}

/** Chip-style dropdown with checkboxes and a count badge (Jira-like). */
export function MultiSelectFilter({
  label,
  options,
  value,
  onChange,
}: MultiSelectFilterProps) {
  const count = value.length;
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-8 gap-1.5 text-xs font-medium",
            count > 0 &&
              "border-teal-500/50 bg-teal-500/10 text-teal-700 hover:bg-teal-500/15 dark:text-teal-300",
          )}
        >
          {label}
          {count > 0 && (
            <span className="rounded bg-teal-600 px-1.5 text-3xs font-bold tabular-nums text-white">
              {count}
            </span>
          )}
          <Icon icon={ChevronDown} size={13} className="opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={value.includes(option.value)}
            onCheckedChange={() => toggle(option.value)}
            // Keep the menu open so several values can be ticked in one go.
            onSelect={(e) => e.preventDefault()}
            className="text-xs"
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={count === 0}
          onSelect={(e) => {
            e.preventDefault();
            onChange([]);
          }}
          className="text-xs text-muted-foreground"
        >
          Clear selection
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
