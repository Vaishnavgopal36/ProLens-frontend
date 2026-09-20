import * as React from "react";
import { cn } from "@/lib/utils";

type CheckboxSize = "sm" | "md";

const BOX_SIZE: Record<CheckboxSize, string> = {
  sm: "h-4 w-4",
  md: "h-[18px] w-[18px]",
};

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> {
  /** Text shown beside the box. Clicking it toggles the checkbox. */
  label?: React.ReactNode;
  labelClassName?: string;
  size?: CheckboxSize;
  /** Convenience over onChange: called with the new checked state. */
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * The app's checkbox: a checkmark that draws itself, a small "wave" on the
 * box and a ripple that fades out from it when checked.
 *
 * It is a real (visually hidden) native input, so keyboard use, forms, the
 * `disabled` state and screen readers behave exactly like a plain checkbox.
 * Without a visible `label`, pass `aria-label`.
 */
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      labelClassName,
      size = "md",
      className,
      onChange,
      onCheckedChange,
      disabled,
      ...props
    },
    ref,
  ) => (
    <label
      className={cn(
        "group inline-flex select-none items-center gap-2",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className,
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        disabled={disabled}
        onChange={(e) => {
          onChange?.(e);
          onCheckedChange?.(e.target.checked);
        }}
        // sr-only (not display:none) keeps it focusable for keyboard users.
        className="peer sr-only"
        {...props}
      />
      <span
        aria-hidden
        className={cn(
          "relative shrink-0 rounded-[3px] border border-input bg-canvas-surface transition-all duration-200",
          BOX_SIZE[size],
          // Hover / focus
          "group-hover:border-teal-500 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-canvas-surface",
          // Checked: solid fill plus a quick "wave"
          "peer-checked:animate-checkbox-wave peer-checked:border-teal-600 peer-checked:bg-teal-600 dark:peer-checked:border-teal-500 dark:peer-checked:bg-teal-500",
          // Ripple that grows from the box and fades out
          "before:absolute before:inset-0 before:block before:scale-0 before:rounded-full before:bg-teal-600 before:content-[''] dark:before:bg-teal-500",
          "peer-checked:before:scale-[3.5] peer-checked:before:opacity-0 peer-checked:before:transition-all peer-checked:before:duration-[600ms]",
          // The checkmark is drawn by animating its stroke
          "[&_svg]:absolute [&_svg]:inset-0 [&_svg]:m-auto [&_svg]:h-2.5 [&_svg]:w-3 [&_svg]:fill-none [&_svg]:stroke-white [&_svg]:stroke-2 [&_svg]:[stroke-dasharray:16px] [&_svg]:[stroke-dashoffset:16px] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round] [&_svg]:transition-all [&_svg]:duration-300 [&_svg]:delay-100",
          "peer-checked:[&_svg]:[stroke-dashoffset:0]",
          "motion-reduce:animate-none motion-reduce:before:hidden motion-reduce:[&_svg]:transition-none",
        )}
      >
        <svg viewBox="0 0 12 10">
          <polyline points="1.5 6 4.5 9 10.5 1" />
        </svg>
      </span>
      {label && (
        <span className={cn("text-sm text-foreground", labelClassName)}>
          {label}
        </span>
      )}
    </label>
  ),
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
