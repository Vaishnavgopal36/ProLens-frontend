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

export type UserRole = "employee" | "manager" | "admin" | "super_admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarUrl?: string;
  role: UserRole;
}
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** remember=false keeps the session for this browser tab only. */
  setUser: (user: AuthUser | null, remember?: boolean) => void;
  logout: () => void;
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

  const logout = React.useCallback(() => setUser(null), [setUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        setUser,
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
