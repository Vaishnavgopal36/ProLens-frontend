import type { SSOConnection } from "../components/sso-dialog";

/**
 * Stand-in for GET /sso-connections (the org's single connection). SSO login
 * only works once the super admin has created the connection for the org, so
 * signing in with SSO implies it exists; the admin then sees it pre-filled.
 * The client secret is never returned by the API, so it is never stored here.
 */
let orgConnection: SSOConnection | null = null;

export const getOrgSsoConnection = () => orgConnection;
export const setOrgSsoConnection = (connection: SSOConnection | null) => {
  orgConnection = connection;
};

/** What the super admin would have configured when provisioning the org. */
export function seedProvisionedSsoConnection() {
  orgConnection ??= {
    provider: "azure_ad",
    tenantId: "72f988bf-86f1-41af-91ab-2d7cd011db47",
    clientId: "b4c1e2a9-3d5f-4a7e-9c10-6f8d2e4b7a13",
    connectedAt: new Date().toISOString(),
  };
}
