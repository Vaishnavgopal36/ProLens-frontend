import * as React from "react";
import { Filter as FilterIcon, Check, X } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useFilterHotkey } from "@/hooks/use-hotkey";
import type { FiltersState } from "./use-filters";

interface FilterDropdownProps<T> {
  filters: FiltersState<T>;
  className?: string;
}

export function FilterDropdown<T>({
  filters,
  className,
}: FilterDropdownProps<T>) {
  const { fields, selected, setValues, activeCount, clear } = filters;
  const [open, setOpen] = React.useState(false);
  useFilterHotkey({ open, onToggle: () => setOpen((o) => !o) });
  const [activeFieldKey, setActiveFieldKey] = React.useState<string>(
    fields[0]?.key || "",
  );

  const activeField = fields.find((f) => f.key === activeFieldKey) || fields[0];

  const handleToggleOption = (fieldKey: string, optionValue: string) => {
    const currentList = selected[fieldKey] || [];
    const isChecked = currentList.includes(optionValue);
    const updated = isChecked
      ? currentList.filter((v) => v !== optionValue)
      : [...currentList, optionValue];
    setValues(fieldKey, updated);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant={activeCount > 0 ? "secondary" : "outline"}
                size="sm"
                className={cn(
                  "h-8 gap-1.5 text-xs font-medium border-border-subtle bg-canvas-surface",
                  activeCount > 0 &&
                    "border-teal-500/50 text-teal-600 dark:text-teal-400 bg-teal-500/5",
                )}
              >
                <Icon icon={FilterIcon} size={14} className="opacity-80" />
                <span>Filter</span>
                {activeCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-0.5 px-1.5 py-0 text-3xs font-bold rounded-full bg-teal-500 text-white"
                  >
                    {activeCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            Filter{" "}
            <span className="ml-1 rounded bg-white/15 px-1 font-semibold">
              Shift + F
            </span>
          </TooltipContent>
        </Tooltip>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-[340px] p-0 shadow-xl border-border-subtle bg-canvas-overlay overflow-hidden rounded-xl"
        >
          {/* Top Jira Header Bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle bg-canvas-bg/60">
            <span className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider">
              Fields
            </span>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={clear}
                className="text-2xs font-medium text-destructive hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* 2-Column Jira Menu */}
          <div className="flex min-h-[220px] divide-x divide-border-subtle">
            {/* Left Column: Field Names (Assignee, Status, etc.) */}
            <div className="w-[120px] bg-canvas-surface/40 p-1 space-y-0.5 shrink-0">
              {fields.map((field) => {
                const count = selected[field.key]?.length || 0;
                const isCurrent = field.key === activeFieldKey;

                return (
                  <button
                    key={field.key}
                    type="button"
                    onClick={() => setActiveFieldKey(field.key)}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-between",
                      isCurrent
                        ? "bg-canvas-surface text-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-canvas-surface/50",
                    )}
                  >
                    <span className="truncate">{field.label}</span>
                    {count > 0 && (
                      <span className="h-4 w-4 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 font-bold text-4xs flex items-center justify-center">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Column: Values for the selected field */}
            <div className="flex-1 p-2 flex flex-col justify-between">
              {activeField && (
                <div className="space-y-1 overflow-y-auto max-h-[190px] pr-1">
                  <div className="pb-1.5 mb-1 border-b border-border-subtle text-2xs font-medium text-muted-foreground">
                    <span>{activeField.label}</span>
                  </div>

                  {activeField.options.map((option) => {
                    const isChecked = (
                      selected[activeField.key] || []
                    ).includes(option.value);

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          handleToggleOption(activeField.key, option.value)
                        }
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs hover:bg-canvas-surface transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-3.5 w-3.5 rounded border flex items-center justify-center transition-colors",
                              isChecked
                                ? "bg-teal-500 border-teal-500 text-white"
                                : "border-border-subtle bg-canvas-bg",
                            )}
                          >
                            {isChecked && (
                              <Icon icon={Check} size={11} strokeWidth={3} />
                            )}
                          </div>
                          <span
                            className={cn(
                              isChecked
                                ? "font-semibold text-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            {option.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Jira-style "Clear filters" action outside */}
      {activeCount > 0 && (
        <button
          type="button"
          onClick={clear}
          className="flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Clear filters
          <Icon icon={X} size={12} />
        </button>
      )}
    </div>
  );
}
