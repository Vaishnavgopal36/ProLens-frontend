import * as React from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface LoginCredentials {
  email: string;
  password: string;
  /** false = keep the session for this browser tab only. */
  remember: boolean;
}

export type SsoProvider = "microsoft" | "google";

interface LoginFormProps extends Omit<
  React.ComponentPropsWithoutRef<"form">,
  "onSubmit"
> {
  /** Resolve on success; throw an Error with a user-facing message to fail. */
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  /** Start an SSO flow. Same contract as onSubmit. */
  onSsoSignIn: (provider: SsoProvider) => Promise<void>;
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 23 23" aria-hidden="true" className="!size-[18px]">
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#7fba00" d="M12 1h10v10H12z" />
      <path fill="#00a4ef" d="M1 12h10v10H1z" />
      <path fill="#ffb900" d="M12 12h10v10H12z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="!size-[18px]">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.27-2.09 3.57-5.17 3.57-8.81z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3c-1.07.72-2.44 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.29v3.09A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l4-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.62l4 3.09C6.23 6.86 8.88 4.75 12 4.75z"
      />
    </svg>
  );
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  email?: string;
  password?: string;
}

const SSO_PROVIDERS: {
  provider: SsoProvider;
  label: string;
  icon: React.ReactNode;
}[] = [
  { provider: "microsoft", label: "Microsoft", icon: <MicrosoftIcon /> },
  { provider: "google", label: "Google", icon: <GoogleIcon /> },
];

/** Staggers the entrance of each row so the card assembles top to bottom. */
const reveal = (index: number): React.CSSProperties => ({
  animationDelay: `${index * 60 + 120}ms`,
});
const REVEAL_CLASS =
  "animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both motion-reduce:animate-none";

export function LoginForm({
  onSubmit,
  onSsoSignIn,
  className,
  ...props
}: LoginFormProps) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [ssoPending, setSsoPending] = React.useState<SsoProvider | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const busy = submitting || ssoPending !== null;
  const formRef = React.useRef<HTMLFormElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  // The Sign in button stays a quiet ghost until there is something valid to
  // submit: a well-formed email and a typed password.
  const ready = EMAIL_PATTERN.test(email.trim()) && password.length > 0;

  const validateEmail = (): string | undefined => {
    const trimmed = email.trim();
    if (!trimmed) return "Enter your work email address.";
    if (!EMAIL_PATTERN.test(trimmed))
      return "Enter a valid email address, like name@tarento.com.";
    return undefined;
  };
  const validatePassword = (): string | undefined =>
    password ? undefined : "Enter your password.";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: FieldErrors = {
      email: validateEmail(),
      password: validatePassword(),
    };
    setFieldErrors(errors);
    setFormError(null);
    if (errors.email || errors.password) {
      // Put the cursor on the first field that needs attention.
      (errors.email ? emailRef : passwordRef).current?.focus();
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ email: email.trim(), password, remember });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to sign in.");
      setSubmitting(false);
    }
  };

  const handleSso = async (provider: SsoProvider) => {
    setFieldErrors({});
    setFormError(null);
    setSsoPending(provider);
    try {
      await onSsoSignIn(provider);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to sign in.");
      setSsoPending(null);
    }
  };

  /**
   * Enter drives the whole flow: in the email field it validates and moves on
   * to the password; anywhere else in the form (password, checkbox) it signs
   * in. Buttons and links keep their own Enter behaviour.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
    if ((e.target as HTMLElement).closest("button, a")) return;
    e.preventDefault();
    if (e.target === emailRef.current) {
      const error = validateEmail();
      setFieldErrors((prev) => ({ ...prev, email: error }));
      if (!error) passwordRef.current?.focus();
      return;
    }
    formRef.current?.requestSubmit();
  };

  return (
    <form
      ref={formRef}
      noValidate
      onKeyDown={handleKeyDown}
      onSubmit={handleSubmit}
      className={cn("grid gap-5", className)}
      {...props}
    >
      <div className={cn("grid gap-2", REVEAL_CLASS)} style={reveal(0)}>
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          ref={emailRef}
          id="email"
          autoFocus
          type="text"
          inputMode="email"
          autoComplete="email"
          placeholder="name@tarento.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setFieldErrors((prev) => ({ ...prev, email: undefined }));
          }}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          disabled={busy}
          className="h-11 rounded-lg text-sm focus-visible:ring-2 focus-visible:ring-teal-500/40"
        />
        <FieldError id="email-error" message={fieldErrors.email} />
      </div>

      <div className={cn("grid gap-2", REVEAL_CLASS)} style={reveal(1)}>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
        </div>
        <div className="relative">
          <Input
            ref={passwordRef}
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }}
            aria-invalid={!!fieldErrors.password}
            aria-describedby={
              fieldErrors.password ? "password-error" : undefined
            }
            disabled={busy}
            className="h-11 rounded-lg pr-11 text-sm focus-visible:ring-2 focus-visible:ring-teal-500/40"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon icon={showPassword ? EyeOff : Eye} size={16} />
          </button>
        </div>
        <FieldError id="password-error" message={fieldErrors.password} />
      </div>

      <div
        className={cn(
          "flex items-center justify-between text-sm",
          REVEAL_CLASS,
        )}
        style={reveal(2)}
      >
        <Checkbox
          label="Remember me"
          checked={remember}
          onCheckedChange={setRemember}
          disabled={busy}
        />

        <a
          href="#"
          className="font-medium text-teal-700 underline-offset-4 hover:underline dark:text-teal-400"
        >
          Forgot your password?
        </a>
      </div>

      {formError && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive"
        >
          {formError}
        </p>
      )}

      <div className={REVEAL_CLASS} style={reveal(3)}>
        <Button
          type="submit"
          fx="off"
          variant={ready ? "accent" : "outline"}
          size="lg"
          className={cn(
            "h-11 w-full rounded-lg text-sm transition-colors duration-300",
            !ready && "text-muted-foreground",
          )}
          // Truly inactive (not clickable, not focusable) until the form is
          // ready. Enter in the fields still validates and shows errors.
          disabled={busy || !ready}
        >
          {submitting && <Loader2 className="animate-spin" />}
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </div>

      <div
        className={cn(
          "flex items-center gap-3 text-xs text-muted-foreground",
          REVEAL_CLASS,
        )}
        style={reveal(4)}
      >
        <span className="h-px flex-1 bg-border-subtle" />
        Or sign in with
        <span className="h-px flex-1 bg-border-subtle" />
      </div>

      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
        {SSO_PROVIDERS.map(({ provider, label, icon }, i) => (
          <div key={provider} className={REVEAL_CLASS} style={reveal(5 + i)}>
            <Button
              type="button"
              variant="sweep-soft"
              size="lg"
              className="h-11 w-full gap-2 rounded-lg px-3 text-sm font-semibold"
              disabled={busy}
              onClick={() => handleSso(provider)}
            >
              {ssoPending === provider ? (
                <Loader2 className="animate-spin" />
              ) : (
                icon
              )}
              {label}
            </Button>
          </div>
        ))}
      </div>
    </form>
  );
}
