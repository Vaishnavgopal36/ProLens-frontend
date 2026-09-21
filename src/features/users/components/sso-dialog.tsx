import * as React from "react";
import { ShieldCheck } from "lucide-react";
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
import { ConfirmDialog } from "@/components/composed/confirm-dialog";

export type SSOProvider = "azure_ad" | "google";

/** Mirrors SSOConnectionRead; the client secret is write-only. */
export interface SSOConnection {
  provider: SSOProvider;
  tenantId: string;
  clientId: string;
  connectedAt: string;
}

export const PROVIDER_LABELS: Record<SSOProvider, string> = {
  azure_ad: "Microsoft Entra ID (Azure AD)",
  google: "Google Workspace",
};

const fieldClass = "h-8 text-xs bg-canvas-surface";

interface SSODialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection: SSOConnection | null;
  onSave: (connection: SSOConnection) => void;
  onDisconnect: () => void;
}

const maskId = (id: string) =>
  id.length > 8 ? `${id.slice(0, 4)}…${id.slice(-4)}` : id;

export function SSODialog({
  open,
  onOpenChange,
  connection,
  onSave,
  onDisconnect,
}: SSODialogProps) {
  const [editing, setEditing] = React.useState(false);
  const [provider, setProvider] = React.useState<SSOProvider>("azure_ad");
  const [tenantId, setTenantId] = React.useState("");
  const [clientId, setClientId] = React.useState("");
  const [secret, setSecret] = React.useState("");
  const [errors, setErrors] = React.useState<
    Partial<Record<"tenantId" | "clientId" | "secret", string>>
  >({});
  const [disconnectOpen, setDisconnectOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setEditing(connection === null);
    setProvider(connection?.provider ?? "azure_ad");
    setTenantId(connection?.tenantId ?? "");
    setClientId(connection?.clientId ?? "");
    setSecret("");
    setErrors({});
  }, [open, connection]);

  const showForm = editing || connection === null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (provider === "azure_ad" && !tenantId.trim())
      next.tenantId = "Enter the directory (tenant) ID.";
    if (!clientId.trim()) next.clientId = "Enter the application (client) ID.";
    // An existing connection keeps its stored secret when the field is blank.
    if (!connection && !secret) next.secret = "Enter the client secret.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSave({
      provider,
      tenantId: provider === "azure_ad" ? tenantId.trim() : "",
      clientId: clientId.trim(),
      connectedAt: connection?.connectedAt ?? new Date().toISOString(),
    });
    toast.success(
      connection ? "SSO connection updated." : "SSO connected successfully.",
    );
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="p-5 sm:max-w-[480px]">
        <ModalHeader className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-teal-500/20 bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Icon icon={ShieldCheck} size={17} />
            </div>
            <div>
              <ModalTitle className="text-base font-semibold">
                Single sign-on
              </ModalTitle>
              <ModalDescription className="text-xs">
                Let your people sign in with your identity provider and sync
                them into ProLens.
              </ModalDescription>
            </div>
          </div>
        </ModalHeader>

        {!showForm && connection ? (
          <div className="space-y-3 pt-1 text-xs">
            <div className="flex items-center justify-between rounded-md border border-teal-500/30 bg-teal-500/10 px-3 py-2">
              <span className="flex items-center gap-2 font-semibold text-teal-700 dark:text-teal-400">
                <span className="h-2 w-2 rounded-full bg-teal-500" />
                Connected
              </span>
              <span className="text-2xs text-muted-foreground">
                since {new Date(connection.connectedAt).toLocaleDateString()}
              </span>
            </div>
            <dl className="divide-y divide-border-subtle rounded-md border border-border-subtle">
              <div className="flex justify-between gap-4 px-3 py-2">
                <dt className="text-muted-foreground">Provider</dt>
                <dd className="font-medium text-foreground">
                  {PROVIDER_LABELS[connection.provider]}
                </dd>
              </div>
              {connection.provider === "azure_ad" && (
                <div className="flex justify-between gap-4 px-3 py-2">
                  <dt className="text-muted-foreground">Tenant ID</dt>
                  <dd className="font-medium tabular-nums text-foreground">
                    {maskId(connection.tenantId)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-4 px-3 py-2">
                <dt className="text-muted-foreground">Client ID</dt>
                <dd className="font-medium tabular-nums text-foreground">
                  {maskId(connection.clientId)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-3 py-2">
                <dt className="text-muted-foreground">Client secret</dt>
                <dd className="font-medium text-foreground">••••••••</dd>
              </div>
            </dl>

            <ModalFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDisconnectOpen(true)}
                className="mr-auto text-destructive"
              >
                Disconnect
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>
            </ModalFooter>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-3.5 pt-1 text-xs"
          >
            <div className="space-y-1">
              <Label className="text-xs font-medium">Provider *</Label>
              <Select
                value={provider}
                onValueChange={(v) => setProvider(v as SSOProvider)}
                disabled={connection !== null}
              >
                <SelectTrigger className={fieldClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PROVIDER_LABELS) as SSOProvider[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {PROVIDER_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {provider === "azure_ad" && (
              <div className="space-y-1">
                <Label htmlFor="sso-tenant" className="text-xs font-medium">
                  Directory (tenant) ID *
                </Label>
                <Input
                  id="sso-tenant"
                  value={tenantId}
                  onChange={(e) => {
                    setTenantId(e.target.value);
                    setErrors((p) => ({ ...p, tenantId: undefined }));
                  }}
                  placeholder="00000000-0000-0000-0000-000000000000"
                  aria-invalid={!!errors.tenantId}
                  className={fieldClass}
                />
                <FieldError message={errors.tenantId} />
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="sso-client" className="text-xs font-medium">
                Application (client) ID *
              </Label>
              <Input
                id="sso-client"
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  setErrors((p) => ({ ...p, clientId: undefined }));
                }}
                aria-invalid={!!errors.clientId}
                className={fieldClass}
              />
              <FieldError message={errors.clientId} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="sso-secret" className="text-xs font-medium">
                Client secret {connection ? "" : "*"}
              </Label>
              <Input
                id="sso-secret"
                type="password"
                autoComplete="off"
                value={secret}
                onChange={(e) => {
                  setSecret(e.target.value);
                  setErrors((p) => ({ ...p, secret: undefined }));
                }}
                placeholder={
                  connection ? "Leave blank to keep the current secret" : ""
                }
                aria-invalid={!!errors.secret}
                className={fieldClass}
              />
              <FieldError message={errors.secret} />
            </div>

            <ModalFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  connection ? setEditing(false) : onOpenChange(false)
                }
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="font-semibold">
                {connection ? "Save changes" : "Connect"}
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>

      <ConfirmDialog
        open={disconnectOpen}
        onOpenChange={setDisconnectOpen}
        title="Disconnect SSO"
        variant="destructive"
        description="People who sign in with SSO won't be able to log in until you reconnect. Users already synced stay in the directory."
        confirmLabel="Disconnect"
        onConfirm={() => {
          onDisconnect();
          toast.success("SSO disconnected.");
          onOpenChange(false);
        }}
      />
    </Modal>
  );
}
