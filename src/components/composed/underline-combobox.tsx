import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Icon } from "@/components/ui/icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { underlineFieldClass } from "@/components/ui/underline-input";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
  group?: string;
}

interface UnderlineComboboxProps {
  id?: string;
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  /** Show an ✕ to clear the selection (Kronos behaviour). */
  clearable?: boolean;
}

/** Searchable single-select with the same underline look as UnderlineInput. */
export function UnderlineCombobox({
  id,
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder = "Search…",
  disabled,
  invalid,
  describedBy,
  clearable,
}: UnderlineComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);
  const groups = React.useMemo(() => {
    const map = new Map<string, ComboboxOption[]>();
    options.forEach((o) => {
      const key = o.group ?? "";
      map.set(key, [...(map.get(key) ?? []), o]);
    });
    return [...map.entries()];
  }, [options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative">
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            disabled={disabled}
            className={cn(
              underlineFieldClass,
              "flex items-center justify-between text-left",
              clearable && selected && "pr-14",
              !selected && "text-muted-foreground",
            )}
          >
            <span className="truncate">{selected?.label ?? placeholder}</span>
            <Icon
              icon={ChevronDown}
              size={16}
              className="shrink-0 text-muted-foreground"
            />
          </button>
        </PopoverTrigger>
        {clearable && selected && !disabled && (
          <button
            type="button"
            aria-label="Clear selection"
            onClick={() => onChange("")}
            className="absolute right-6 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon icon={X} size={14} />
          </button>
        )}
      </div>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>No matches found.</CommandEmpty>
            {groups.map(([group, items]) => (
              <CommandGroup key={group || "all"} heading={group || undefined}>
                {items.map((o) => (
                  <CommandItem
                    key={o.value}
                    value={o.label}
                    onSelect={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className="gap-2 text-xs"
                  >
                    <Icon
                      icon={Check}
                      size={14}
                      className={cn(
                        "shrink-0",
                        o.value === value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="truncate">{o.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
