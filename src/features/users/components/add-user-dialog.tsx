import * as React from "react";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import type { UserRole } from "@/lib/api/types";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "employee", label: "Employee" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
];

const fieldClass = "h-8 text-xs bg-canvas-surface";

interface AddUserDialogProps {
  open: boolean;
  designations: string[];
  onOpenChange: (open: boolean) => void;
  onUserAdded: () => void;
}

export function AddUserDialog({
  open,
  designations,
  onOpenChange,
  onUserAdded,
}: AddUserDialogProps) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("employee");
  const [designation, setDesignation] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<{
    firstName?: string;
    email?: string;
    designation?: string;
    password?: string;
  }>({});

  React.useEffect(() => {
    if (open) {
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRole("employee");
      setDesignation("");
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};

    if (!firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (role === "employee" && !designation.trim()) {
      nextErrors.designation = "Employees require a designation.";
    }

    if (password && password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      await api.users.create({
        email: trimmedEmail,
        first_name: firstName.trim(),
        last_name: lastName.trim() || undefined,
        role,
        designation_name: designation.trim() || undefined,
        password: password || undefined,
      });

      toast.success("User added successfully.");
      onOpenChange(false);
      onUserAdded();
    } catch (err: any) {
      const msg =
        err?.response_data?.error_message ||
        err?.message ||
        "Failed to create user. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="p-5 sm:max-w-[480px]">
        <ModalHeader className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-teal-500/20 bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Icon icon={UserPlus} size={17} />
            </div>
            <div>
              <ModalTitle className="text-base font-semibold">
                Add user
              </ModalTitle>
              <ModalDescription className="text-xs">
                Add a new user to your organization directory.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-3.5 pt-1 text-xs"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="add-first" className="text-xs font-medium">
                First name *
              </Label>
              <Input
                id="add-first"
                value={firstName}
                placeholder="Jane"
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setErrors((p) => ({ ...p, firstName: undefined }));
                }}
                aria-invalid={!!errors.firstName}
                className={fieldClass}
                disabled={isSubmitting}
              />
              <FieldError message={errors.firstName} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="add-last" className="text-xs font-medium">
                Last name
              </Label>
              <Input
                id="add-last"
                value={lastName}
                placeholder="Doe"
                onChange={(e) => setLastName(e.target.value)}
                className={fieldClass}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="add-email" className="text-xs font-medium">
              Email address *
            </Label>
            <Input
              id="add-email"
              type="email"
              value={email}
              placeholder="jane.doe@company.com"
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({ ...p, email: undefined }));
              }}
              aria-invalid={!!errors.email}
              className={fieldClass}
              disabled={isSubmitting}
            />
            <FieldError message={errors.email} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Role *</Label>
              <Select
                value={role}
                onValueChange={(val) => setRole(val as UserRole)}
                disabled={isSubmitting}
              >
                <SelectTrigger className={fieldClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="add-designation" className="text-xs font-medium">
                Designation{role === "employee" ? " *" : ""}
              </Label>
              <Input
                id="add-designation"
                list="add-designation-options"
                placeholder={role === "employee" ? "e.g. Frontend Engineer" : "Optional"}
                value={designation}
                onChange={(e) => {
                  setDesignation(e.target.value);
                  setErrors((p) => ({ ...p, designation: undefined }));
                }}
                aria-invalid={!!errors.designation}
                className={fieldClass}
                disabled={isSubmitting}
              />
              <datalist id="add-designation-options">
                {designations.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
              <FieldError message={errors.designation} />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="add-password" className="text-xs font-medium">
              Password <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="add-password"
              type="password"
              placeholder="Leave blank to auto-generate"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((p) => ({ ...p, password: undefined }));
              }}
              aria-invalid={!!errors.password}
              className={fieldClass}
              disabled={isSubmitting}
            />
            <FieldError message={errors.password} />
            <p className="text-2xs text-muted-foreground">
              If omitted, a secure random password is automatically assigned.
            </p>
          </div>

          <ModalFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="font-semibold gap-1.5"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Icon icon={Loader2} size={14} className="animate-spin" />
                  Adding…
                </>
              ) : (
                <>
                  <Icon icon={UserPlus} size={14} />
                  Add user
                </>
              )}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

