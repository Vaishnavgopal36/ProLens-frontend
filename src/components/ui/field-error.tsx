import { cn } from "@/lib/utils";

/**
 * Inline validation message shown under a field. Pair with
 * aria-invalid + aria-describedby={id} on the input (Input styles itself red
 * when aria-invalid is true). Forms must use noValidate so browsers never show
 * their own bubbles.
 */
export function FieldError({
  id,
  message,
  className,
}: {
  id?: string;
  message?: string;
  className?: string;
}) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className={cn("text-2xs font-medium text-destructive", className)}
    >
      {message}
    </p>
  );
}
