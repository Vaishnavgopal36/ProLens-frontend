import * as React from "react";
import { UserPlus, Mail, Shield, Briefcase, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import type { ProjectInvite, UserRole } from "@/types/project";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendInvite: (newInvite: ProjectInvite) => void;
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  onSendInvite,
}: InviteMemberDialogProps) {
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("employee");
  const [designation, setDesignation] = React.useState("");
  const [expiresInDays, setExpiresInDays] = React.useState("7");
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      setError("Email address is required.");
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid work email address.");
      return;
    }

    const newInvite: ProjectInvite = {
      id: `inv-${Date.now()}`,
      email: trimmedEmail,
      role,
      expiresInDays: Number(expiresInDays) || 7,
    };

    onSendInvite(newInvite);
    toast.success(`Invitation dispatched to ${trimmedEmail}`);

    // Reset Form State
    setEmail("");
    setDesignation("");
    setRole("employee");
    setExpiresInDays("7");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-5">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 shrink-0">
              <Icon icon={UserPlus} size={17} />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Invite Team Member
              </DialogTitle>
              <DialogDescription className="text-xs">
                Grant workspace access and assign governance privileges.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-3.5 pt-1">
          {/* Email Address */}
          <div className="space-y-1">
            <Label
              htmlFor="invite-email"
              className={cn("text-xs font-medium", error && "text-destructive")}
            >
              Email Address *
            </Label>
            <div className="relative">
              <Icon
                icon={Mail}
                size={14}
                className={cn(
                  "absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground",
                  error && "text-destructive",
                )}
              />
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@tarento.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                className={cn(
                  "h-8 pl-8 text-xs bg-canvas-surface transition-colors",
                  error &&
                    "border-destructive focus-visible:ring-destructive/30",
                )}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-[11px] font-medium text-destructive">
                {error}
              </p>
            )}
          </div>

          {/* Role & Expiration Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* System Role */}
            <div className="space-y-1">
              <Label htmlFor="invite-role" className="text-xs font-medium">
                Access Role
              </Label>
              <Select
                value={role}
                onValueChange={(val) => setRole(val as UserRole)}
              >
                <SelectTrigger
                  id="invite-role"
                  className="h-8 text-xs bg-canvas-surface"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Icon
                      icon={Shield}
                      size={13}
                      className="text-muted-foreground"
                    />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">
                    Employee (Contributor)
                  </SelectItem>
                  <SelectItem value="manager">Manager (Lead)</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expiration Window */}
            <div className="space-y-1">
              <Label htmlFor="invite-expiry" className="text-xs font-medium">
                Link Expiration
              </Label>
              <Select value={expiresInDays} onValueChange={setExpiresInDays}>
                <SelectTrigger
                  id="invite-expiry"
                  className="h-8 text-xs bg-canvas-surface"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Icon
                      icon={Clock}
                      size={13}
                      className="text-muted-foreground"
                    />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="7">7 Days (Standard)</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Operational Title / Designation */}
          <div className="space-y-1">
            <Label htmlFor="invite-designation" className="text-xs font-medium">
              Operational Designation (Optional)
            </Label>
            <div className="relative">
              <Icon
                icon={Briefcase}
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="invite-designation"
                placeholder="e.g. Senior Frontend Engineer"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="h-8 pl-8 text-xs bg-canvas-surface"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
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
              <Icon icon={Mail} size={14} />
              <span>Send Invitation</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
