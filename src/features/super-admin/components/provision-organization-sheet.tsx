import * as React from "react";
import { Building2, Mail, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
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
  const [error, setError] = React.useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setSlug("");
    setSlugTouched(false);
    setAdminName("");
    setAdminEmail("");
    setError(null);
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

    if (!trimmedName || !trimmedSlug || !trimmedAdminName) {
      setError("Organization name, slug, and primary admin name are required.");
      return;
    }

    if (!emailRegex.test(trimmedAdminEmail)) {
      setError("Please enter a valid primary admin email address.");
      return;
    }

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
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        onOpenChange(next);
      }}
    >
      <SheetContent className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 shrink-0">
              <Icon icon={Building2} size={17} />
            </div>
            <div>
              <SheetTitle>New Organization</SheetTitle>
              <SheetDescription>
                Provision a new tenant and assign its primary administrator.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

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
                  if (error) setError(null);
                }}
                className="h-9 text-sm"
                autoFocus
              />
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
                  if (error) setError(null);
                }}
                className="h-9 text-sm font-mono"
              />
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
                      if (error) setError(null);
                    }}
                    className="h-9 pl-8 text-sm"
                  />
                </div>
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
                    type="email"
                    placeholder="alex@horizonmedia.com"
                    value={adminEmail}
                    onChange={(e) => {
                      setAdminEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    className={cn(
                      "h-9 pl-8 text-sm",
                      error &&
                        "border-destructive focus-visible:ring-destructive/30",
                    )}
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-2xs font-medium text-destructive">{error}</p>
            )}
          </div>

          <SheetFooter>
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
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
