import * as React from "react";
import { UserCog } from "lucide-react";
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
import type { DirectoryUser } from "../api/mock-data";

const ROLES = [
  { value: "employee", label: "Employee" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
];

const fieldClass = "h-8 text-xs bg-canvas-surface";

interface EditUserDialogProps {
  user: DirectoryUser | null;
  designations: string[];
  onOpenChange: (open: boolean) => void;
  onSave: (
    id: string,
    patch: Pick<DirectoryUser, "name" | "role" | "designation">,
  ) => void;
}

export function EditUserDialog({
  user,
  designations,
  onOpenChange,
  onSave,
}: EditUserDialogProps) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [role, setRole] = React.useState("employee");
  const [designation, setDesignation] = React.useState("");
  const [errors, setErrors] = React.useState<{
    firstName?: string;
    designation?: string;
  }>({});

  React.useEffect(() => {
    if (!user) return;
    const [first = "", ...rest] = user.name.split(" ");
    setFirstName(first);
    setLastName(rest.join(" "));
    setRole(String(user.role));
    setDesignation(user.designation);
    setErrors({});
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const next: typeof errors = {};
    if (!firstName.trim()) next.firstName = "Enter a first name.";
    // The API requires every employee to have a designation.
    if (role === "employee" && !designation.trim())
      next.designation = "Employees need a designation.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSave(user.id, {
      name: [firstName.trim(), lastName.trim()].filter(Boolean).join(" "),
      role,
      designation: designation.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Modal open={user !== null} onOpenChange={onOpenChange}>
      <ModalContent className="p-5 sm:max-w-[460px]">
        <ModalHeader className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-teal-500/20 bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Icon icon={UserCog} size={17} />
            </div>
            <div>
              <ModalTitle className="text-base font-semibold">
                Edit user
              </ModalTitle>
              <ModalDescription className="text-xs">
                Update {user?.name}'s name, role and designation.
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
              <Label htmlFor="edit-first" className="text-xs font-medium">
                First name *
              </Label>
              <Input
                id="edit-first"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setErrors((p) => ({ ...p, firstName: undefined }));
                }}
                aria-invalid={!!errors.firstName}
                className={fieldClass}
              />
              <FieldError message={errors.firstName} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-last" className="text-xs font-medium">
                Last name
              </Label>
              <Input
                id="edit-last"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Email</Label>
            <Input
              value={user?.email ?? ""}
              readOnly
              disabled
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Role *</Label>
              <Select value={role} onValueChange={setRole}>
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
              <Label htmlFor="edit-designation" className="text-xs font-medium">
                Designation{role === "employee" ? " *" : ""}
              </Label>
              <Input
                id="edit-designation"
                list="designation-options"
                value={designation}
                onChange={(e) => {
                  setDesignation(e.target.value);
                  setErrors((p) => ({ ...p, designation: undefined }));
                }}
                aria-invalid={!!errors.designation}
                className={fieldClass}
              />
              <datalist id="designation-options">
                {designations.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
              <FieldError message={errors.designation} />
            </div>
          </div>

          <ModalFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-semibold">
              Save changes
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
