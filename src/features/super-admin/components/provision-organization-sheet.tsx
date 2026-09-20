import * as React from "react";
import { Building2, Mail, User } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/modal";
import { HotkeyHint } from "@/components/ui/hotkey-hint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field-error";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { toast } from "sonner";
import type { ProvisionOrganizationInput } from "../api/types";

interface ProvisionOrganizationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProvision: (input: ProvisionOrganizationInput) => void;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProvisionOrganizationSheet({
  open,
  onOpenChange,
  onProvision,
}: ProvisionOrganizationSheetProps) {
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [adminName, setAdminName] = React.useState("");
  const [adminEmail, setAdminEmail] = React.useState("");
  const [errors, setErrors] = React.useState<{
    name?: string;
    slug?: string;
    adminName?: string;
    adminEmail?: string;
  }>({});
  const clearError = (key: keyof typeof errors) =>
    setErrors((prev) => ({ ...prev, [key]: undefined }));

  const resetForm = () => {
    setName("");
    setSlug("");
    setSlugTouched(false);
    setAdminName("");
    setAdminEmail("");
    setErrors({});
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();
    const trimmedAdminName = adminName.trim();
    const trimmedAdminEmail = adminEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const next: typeof errors = {};
    if (!trimmedName) next.name = "Organization name is required.";
    if (!trimmedSlug) next.slug = "Slug is required.";
    else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(trimmedSlug))
      next.slug = "Use lowercase letters, numbers and single hyphens only.";
    if (!trimmedAdminName) next.adminName = "Primary admin name is required.";
    if (!trimmedAdminEmail)
      next.adminEmail = "Primary admin email is required.";
    else if (!emailRegex.test(trimmedAdminEmail))
      next.adminEmail = "Enter a valid email address, like name@company.com.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onProvision({
      name: trimmedName,
      slug: trimmedSlug,
      primaryAdminName: trimmedAdminName,
      primaryAdminEmail: trimmedAdminEmail,
    });
    toast.success(`${trimmedName} provisioned`);
    resetForm();
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        onOpenChange(next);
      }}
    >
      <ModalContent className="flex flex-col sm:max-w-md">
        <ModalHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 shrink-0">
              <Icon icon={Building2} size={17} />
            </div>
            <div>
              <ModalTitle>New Organization</ModalTitle>
              <ModalDescription>
                Provision a new tenant and assign its primary administrator.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-1 flex-col justify-between"
        >
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="org-name" className="text-xs font-medium">
                Organization Name *
              </Label>
              <Input
                id="org-name"
                placeholder="Horizon Media"
                value={name}
                onChange={(e) => {
                  handleNameChange(e.target.value);
                  clearError("name");
                  clearError("slug");
                }}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "org-name-error" : undefined}
                className="h-9 text-sm"
                autoFocus
              />
              <FieldError id="org-name-error" message={errors.name} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="org-slug" className="text-xs font-medium">
                Slug *
              </Label>
              <Input
                id="org-slug"
                placeholder="horizon-media"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                  clearError("slug");
                }}
                aria-invalid={!!errors.slug}
                aria-describedby={errors.slug ? "org-slug-error" : undefined}
                className="h-9 text-sm font-mono"
              />
              <FieldError id="org-slug-error" message={errors.slug} />
              <p className="text-2xs text-muted-foreground">
                Auto-generated from the organization name — edit if needed.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 border-t border-border-subtle pt-4">
              <p className="text-xs font-semibold text-foreground">
                Primary Admin
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="admin-name" className="text-xs font-medium">
                  Name *
                </Label>
                <div className="relative">
                  <Icon
                    icon={User}
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="admin-name"
                    placeholder="Alex Morgan"
                    value={adminName}
                    onChange={(e) => {
                      setAdminName(e.target.value);
                      clearError("adminName");
                    }}
                    aria-invalid={!!errors.adminName}
                    aria-describedby={
                      errors.adminName ? "admin-name-error" : undefined
                    }
                    className="h-9 pl-8 text-sm"
                  />
                </div>
                <FieldError id="admin-name-error" message={errors.adminName} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admin-email" className="text-xs font-medium">
                  Email *
                </Label>
                <div className="relative">
                  <Icon
                    icon={Mail}
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="admin-email"
                    type="text"
                    inputMode="email"
                    placeholder="alex@horizonmedia.com"
                    value={adminEmail}
                    onChange={(e) => {
                      setAdminEmail(e.target.value);
                      clearError("adminEmail");
                    }}
                    aria-invalid={!!errors.adminEmail}
                    aria-describedby={
                      errors.adminEmail ? "admin-email-error" : undefined
                    }
                    className="h-9 pl-8 text-sm"
                  />
                </div>
                <FieldError
                  id="admin-email-error"
                  message={errors.adminEmail}
                />
              </div>
            </div>
          </div>

          <ModalFooter>
            <HotkeyHint className="mr-auto" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              className="gap-1.5 font-semibold"
            >
              <Icon icon={Building2} size={14} />
              <span>Provision Organization</span>
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
