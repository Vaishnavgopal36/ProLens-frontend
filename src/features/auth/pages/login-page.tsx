import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers";
import { useForcedLightTheme } from "@/hooks/use-forced-light-theme";
import { BrandMark } from "@/components/composed/brand-mark";
import { BRAND_LIGHT_PALETTE, Ribbon } from "@/components/composed/ribbon";
import { authenticate, ssoAccount } from "../api/demo-accounts";
import { seedProvisionedSsoConnection } from "@/features/users/api/sso-store";
import { LoginForm, type LoginCredentials } from "../components/login-form";

export function LoginPage() {
  useForcedLightTheme();
  const { isAuthenticated, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  // Placeholder sign-in: swap the bodies for the real API / OAuth calls.
  // Throw an Error to surface its message on the form.
  const handleSignIn = async ({
    email,
    password,
    remember,
  }: LoginCredentials) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    setUser(authenticate(email, password), remember);
    navigate(redirectTo, { replace: true });
  };

  const handleSsoSignIn = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    seedProvisionedSsoConnection();
    setUser(ssoAccount());
    navigate(redirectTo, { replace: true });
  };

  return (
    <Ribbon palette={BRAND_LIGHT_PALETTE} className="font-sans text-foreground">
      <header className="flex items-center gap-2.5 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <BrandMark size={24} tone="on-light" />
        <span className="text-base font-semibold tracking-tight sm:text-lg">
          ProLens
        </span>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-10 pt-2 sm:px-6">
        <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700 motion-reduce:animate-none">
          <div className="overflow-hidden rounded-2xl border border-border-subtle bg-canvas-surface shadow-xl shadow-navy-900/10">
            <div className="space-y-6 p-6 min-[400px]:p-8 sm:space-y-7 sm:p-10">
              <h1 className="text-xl font-bold tracking-tight min-[400px]:text-2xl">
                Sign in to your account
              </h1>
              <LoginForm
                onSubmit={handleSignIn}
                onSsoSignIn={handleSsoSignIn}
              />
            </div>
          </div>
        </div>
      </main>
    </Ribbon>
  );
}
