import * as React from "react";

// --- Theme & UI Context ---

export type ThemeMode = "light" | "dark" | "system";

interface UIContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  cycleTheme: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

const UIContext = React.createContext<UIContextType | undefined>(undefined);

const getStoredTheme = (): ThemeMode => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("prolens_theme") as ThemeMode;
    if (saved) return saved;
  }
  return "dark";
};

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeMode>(getStoredTheme);
  const [isSidebarOpen, setSidebarOpen] = React.useState<boolean>(false);

  const applyTheme = React.useCallback((mode: ThemeMode) => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (mode === "system") {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      root.classList.add(systemDark ? "dark" : "light");
    } else {
      root.classList.add(mode);
    }
  }, []);

  React.useEffect(() => {
    applyTheme(theme);
    if (typeof window !== "undefined") {
      localStorage.setItem("prolens_theme", theme);
    }
  }, [theme, applyTheme]);

  // Listen for system theme changes if mode is 'system'
  React.useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, applyTheme]);

  const setTheme = React.useCallback((mode: ThemeMode) => {
    setThemeState(mode);
  }, []);

  const cycleTheme = React.useCallback(() => {
    setThemeState((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "system";
      return "light";
    });
  }, []);

  const toggleSidebar = React.useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return (
    <UIContext.Provider
      value={{
        theme,
        setTheme,
        cycleTheme,
        isSidebarOpen,
        toggleSidebar,
        setSidebarOpen,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI(): UIContextType {
  const context = React.useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}

// --- Auth Context ---

import { authApi } from "@/lib/api/auth";
import type { CurrentUser } from "@/lib/api/types";

export type UserRole = "employee" | "manager" | "admin" | "super_admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarUrl?: string;
  role: UserRole;
  designation?: string | null;
  organizationId?: string | null;
}

export function mapCurrentUserToAuthUser(cu: CurrentUser): AuthUser {
  const name =
    [cu.first_name, cu.last_name].filter(Boolean).join(" ") ||
    cu.email.split("@")[0];
  const initials =
    ((cu.first_name?.[0] || "") + (cu.last_name?.[0] || "")).toUpperCase() ||
    cu.email.slice(0, 2).toUpperCase();
  return {
    id: cu.id,
    name,
    email: cu.email,
    initials,
    role: cu.role,
    designation: cu.designation,
    organizationId: cu.organization_id,
  };
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** remember=false keeps the session for this browser tab only. */
  setUser: (user: AuthUser | null, remember?: boolean) => void;
  /** Patch the signed-in user, keeping the session where it is stored. */
  updateUser: (patch: Partial<AuthUser>) => void;
  signIn: (
    email: string,
    password: string,
    remember?: boolean,
  ) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = "prolens_user";

function readStoredUser(): AuthUser | null {
  try {
    const raw =
      localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    return parsed?.email && parsed?.role ? (parsed as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Session persists across reloads; a fresh browser starts at /login.
  const [user, setUserState] = React.useState<AuthUser | null>(readStoredUser);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const setUser = React.useCallback(
    (next: AuthUser | null, remember: boolean = true) => {
      setUserState(next);
      try {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        if (next) {
          (remember ? localStorage : sessionStorage).setItem(
            SESSION_KEY,
            JSON.stringify(next),
          );
        }
      } catch {
        /* storage unavailable: session lasts until reload */
      }
    },
    [],
  );

  // Sync session with backend on mount
  React.useEffect(() => {
    let isMounted = true;
    authApi
      .getMe()
      .then((currentUser) => {
        if (!isMounted) return;
        const authUser = mapCurrentUserToAuthUser(currentUser);
        setUser(authUser, true);
      })
      .catch(() => {
        if (!isMounted) return;
        // If unauthenticated or token expired, clear user
        setUserState(null);
        try {
          localStorage.removeItem(SESSION_KEY);
          sessionStorage.removeItem(SESSION_KEY);
        } catch {
          /* ignore */
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [setUser]);

  const updateUser = React.useCallback((patch: Partial<AuthUser>) => {
    setUserState((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      try {
        const store = localStorage.getItem(SESSION_KEY)
          ? localStorage
          : sessionStorage;
        store.setItem(SESSION_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  const signIn = React.useCallback(
    async (email: string, password: string, remember: boolean = true) => {
      await authApi.login({ email, password });
      const currentUser = await authApi.getMe();
      const authUser = mapCurrentUserToAuthUser(currentUser);
      setUser(authUser, remember);
      return authUser;
    },
    [setUser],
  );

  const logout = React.useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    } finally {
      setUser(null);
    }
  }, [setUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        setUser,
        updateUser,
        signIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// --- Combined App Providers Tree ---

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <UIProvider>
      <AuthProvider>{children}</AuthProvider>
    </UIProvider>
  );
}
