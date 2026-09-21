import * as React from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/app/providers";
import { MOCK_USERS } from "@/features/users/api/mock-data";

const PASSWORD_MIN_LENGTH = 8;
const ROLE_LABELS: Record<string, string> = {
  employee: "Employee",
  manager: "Manager",
  admin: "Admin",
  super_admin: "Super admin",
};

// Stand-in for the server-side hash until the API is wired up: every demo
// account starts with "password", and a change lasts until the page reloads.
let mockPassword = "password";

const fieldClass = "h-8 text-xs bg-canvas-surface";

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium">{label}</Label>
      <Input value={value} readOnly disabled className={fieldClass} />
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border-subtle bg-canvas-surface p-5 shadow-xs">
      <div className="mb-4 border-b border-border-subtle pb-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </Card>
  );
}

export function ProfileSettingsPage() {
  const { user, updateUser } = useAuth();

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [profileError, setProfileError] = React.useState<string>();

  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [pwErrors, setPwErrors] = React.useState<{
    current?: string;
    next?: string;
    confirm?: string;
  }>({});

  // Start from the saved name; re-sync if it changes elsewhere.
  React.useEffect(() => {
    const [first = "", ...rest] = (user?.name ?? "").split(" ");
    setFirstName(first);
    setLastName(rest.join(" "));
  }, [user?.name]);

  if (!user) return null;

  const designation =
    MOCK_USERS.find((u) => u.email === user.email)?.designation ?? "—";

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const f = firstName.trim();
    const l = lastName.trim();
    if (!f) return setProfileError("Enter your first name.");
    if (f.length > 100 || l.length > 100)
      return setProfileError("Names must be 100 characters or fewer.");
    setProfileError(undefined);
    updateUser({
      name: [f, l].filter(Boolean).join(" "),
      initials: ((f[0] ?? "") + (l[0] ?? f[1] ?? "")).toUpperCase(),
    });
    toast.success("Profile updated.");
  };

  const changePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof pwErrors = {};
    if (!current) errs.current = "Enter your current password.";
    else if (current !== mockPassword)
      errs.current = "Current password is incorrect.";
    if (next.length < PASSWORD_MIN_LENGTH)
      errs.next = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
    else if (new TextEncoder().encode(next).length > 72)
      errs.next = "Password must be at most 72 bytes.";
    else if (next === current)
      errs.next = "New password must differ from the current one.";
    if (confirm !== next) errs.confirm = "Passwords don't match.";
    setPwErrors(errs);
    if (Object.keys(errs).length > 0) return;

    mockPassword = next;
    setCurrent("");
    setNext("");
    setConfirm("");
    toast.success("Password changed.");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <span className="text-xs text-muted-foreground">Account</span>
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">
          Profile settings
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Your name, sign-in details and password
        </p>
      </div>

      <Section
        title="Profile"
        description="Your name is shown across ProLens. Email, role and designation are managed by your admin."
      >
        <form onSubmit={saveProfile} noValidate className="space-y-4 text-xs">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="bg-navy-500 text-sm font-bold text-white dark:bg-foreground dark:text-background">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {ROLE_LABELS[user.role] ?? user.role}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="first-name" className="text-xs font-medium">
                First name *
              </Label>
              <Input
                id="first-name"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setProfileError(undefined);
                }}
                aria-invalid={!!profileError}
                className={fieldClass}
              />
              <FieldError message={profileError} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="last-name" className="text-xs font-medium">
                Last name
              </Label>
              <Input
                id="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={fieldClass}
              />
            </div>
            <ReadOnlyField label="Email" value={user.email} />
            <ReadOnlyField label="Designation" value={designation} />
          </div>
          <p className="text-2xs text-muted-foreground">
            Email, role and designation are managed by your admin.
          </p>

          <div className="flex justify-end">
            <Button type="submit" size="sm" className="font-semibold">
              Save changes
            </Button>
          </div>
        </form>
      </Section>

      <Section
        title="Change password"
        description={`Use at least ${PASSWORD_MIN_LENGTH} characters.`}
      >
        <form
          onSubmit={changePassword}
          noValidate
          className="space-y-4 text-xs"
        >
          <div className="space-y-1">
            <Label htmlFor="current-password" className="text-xs font-medium">
              Current password *
            </Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => {
                setCurrent(e.target.value);
                setPwErrors((p) => ({ ...p, current: undefined }));
              }}
              aria-invalid={!!pwErrors.current}
              className={fieldClass}
            />
            <FieldError message={pwErrors.current} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="new-password" className="text-xs font-medium">
                New password *
              </Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={next}
                onChange={(e) => {
                  setNext(e.target.value);
                  setPwErrors((p) => ({ ...p, next: undefined }));
                }}
                aria-invalid={!!pwErrors.next}
                className={fieldClass}
              />
              <FieldError message={pwErrors.next} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm-password" className="text-xs font-medium">
                Confirm password *
              </Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setPwErrors((p) => ({ ...p, confirm: undefined }));
                }}
                aria-invalid={!!pwErrors.confirm}
                className={fieldClass}
              />
              <FieldError message={pwErrors.confirm} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="sm" className="font-semibold">
              Change password
            </Button>
          </div>
        </form>
      </Section>
    </div>
  );
}
