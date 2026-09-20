import type { AuthUser, UserRole } from "@/app/providers";

/**
 * Placeholder credential store until the auth API exists.
 * Every account shares DEMO_PASSWORD. The employee and manager emails match
 * members in the mock project directory, so their project and insight views
 * are populated (employee → 5 projects; manager → full portfolio).
 */
export const DEMO_PASSWORD = "password";

export interface DemoAccount extends AuthUser {
  label: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "mem-3",
    name: "Marcus Chen",
    email: "employee@tarento.com",
    initials: "MC",
    role: "employee",
    label: "Employee",
  },
  {
    id: "mem-1",
    name: "Alex Morgan",
    email: "manager@tarento.com",
    initials: "AM",
    role: "manager",
    label: "Manager",
  },
  {
    id: "usr_admin",
    name: "Priya Nair",
    email: "admin@tarento.com",
    initials: "PN",
    role: "admin",
    label: "Admin",
  },
  {
    id: "usr_super",
    name: "Vaishnav Gopal",
    email: "superadmin@tarento.com",
    initials: "VG",
    role: "super_admin" satisfies UserRole,
    label: "Super admin",
  },
];

/** Resolves the account, or throws an Error with a user-facing message. */
export function authenticate(email: string, password: string): AuthUser {
  const account = DEMO_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (!account || password !== DEMO_PASSWORD) {
    throw new Error("Incorrect email or password.");
  }
  const { label: _label, ...user } = account;
  return user;
}

/** SSO placeholder: the identity provider would return the user's profile. */
export function ssoAccount(): AuthUser {
  const { label: _label, ...user } = DEMO_ACCOUNTS[1];
  return user;
}
