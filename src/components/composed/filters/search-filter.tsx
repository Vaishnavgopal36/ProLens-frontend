import { Search } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchFilter({
  value,
  onChange,
  placeholder = "Search…",
}: SearchFilterProps) {
  return (
    <div className="relative w-full sm:w-56">
      <Icon
        icon={Search}
        size={14}
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-8 pl-8 text-xs"
      />
    </div>
  );
}
