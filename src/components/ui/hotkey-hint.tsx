import { cn } from "@/lib/utils";

/** "CTRL + K Hotkey" reminder for modals that toggle on the shortcut. */
export function HotkeyHint({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "hidden select-none text-xs font-medium uppercase tracking-wide text-muted-foreground/70 sm:inline",
        className,
      )}
    >
      Ctrl + K <span className="normal-case">Hotkey</span>
    </span>
  );
}
