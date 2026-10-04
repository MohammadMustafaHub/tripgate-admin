import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { usePermission } from "@/hooks/use-permission";
import type { Permission } from "@/lib/permissions";
import { useAuthStep, useUserStore, type AuthStep } from "@/stores/user-store";

const STEP_PATHS: Record<AuthStep, string> = {
  login: "/login",
  verify: "/verify",
  tenant: "/create-tenant",
  ready: "/",
};

/** Loads the current user once and holds rendering until it is known. */
export function SessionGuard() {
  const status = useUserStore((state) => state.status);
  const load = useUserStore((state) => state.load);

  useEffect(() => {
    void load();
  }, [load]);

  if (status === "error") {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-base font-medium">تعذّر الاتصال بالخادم.</p>
        <p className="text-sm text-muted-foreground">
          يرجى التحقق من اتصالك بالإنترنت ثم إعادة المحاولة.
        </p>
        <Button onClick={() => void load()}>إعادة المحاولة</Button>
      </div>
    );
  }

  if (status !== "ready") {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  return <Outlet />;
}

/**
 * Renders the nested routes only when the user is at `step` of the onboarding flow,
 * otherwise redirects to the page for the step they are actually at.
 */
export function AuthGuard({ step }: { step: Exclude<AuthStep, "login"> }) {
  const current = useAuthStep();
  if (current !== step) return <Navigate to={STEP_PATHS[current]} replace />;
  return <Outlet />;
}

/** For signed-out pages (login, register...): signed-in users are sent onward. */
export function GuestGuard() {
  const current = useAuthStep();
  if (current !== "login") return <Navigate to={STEP_PATHS[current]} replace />;
  return <Outlet />;
}

/** For pages that need a role: users without `permission` are sent to the dashboard with a notice. */
export function PermissionGuard({ permission }: { permission: Permission }) {
  const allowed = usePermission(permission);

  useEffect(() => {
    // A fixed id keeps a single notice even when the effect runs twice.
    if (!allowed) toast.add({ id: "permission-denied", type: "error", title: "ليس لديك صلاحية للوصول إلى هذه الصفحة." });
  }, [allowed]);

  if (!allowed) return <Navigate to="/" replace />;
  return <Outlet />;
}
