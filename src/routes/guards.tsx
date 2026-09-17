import { Navigate, Outlet, useLocation } from 'react-router';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/context/auth-context';
import { useTenant } from '@/context/tenant-context';

function SessionPending() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  );
}

/** Gate for the admin panel. Sends signed-out visitors to the login page. */
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <SessionPending />;

  if (status === 'unauthenticated') {
    // Remembered so the login page can return the user to where they were.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

/**
 * Gate for everything behind phone confirmation. Sits inside RequireAuth, so
 * the user is known by the time it runs.
 */
export function RequireConfirmedPhone() {
  const { user } = useAuth();

  if (user && !user.phoneNumberConfirmed) {
    return <Navigate to="/verify-phone" replace />;
  }

  return <Outlet />;
}

function TenantLookupFailed({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-sm text-muted-foreground">
        تعذّر التحقق من بيانات مكتبك. يرجى المحاولة مرة أخرى.
      </p>
      <Button type="button" onClick={onRetry}>
        إعادة المحاولة
      </Button>
    </div>
  );
}

/**
 * Gate for the panel itself. An account with no tenant is sent to create one —
 * a failed lookup is not treated as "no tenant", or a blip would push the user
 * into creating a second one.
 */
export function RequireTenant() {
  const { status, refreshTenant } = useTenant();

  if (status === 'idle' || status === 'loading') return <SessionPending />;
  if (status === 'missing') return <Navigate to="/create-tenant" replace />;
  if (status === 'error') {
    return <TenantLookupFailed onRetry={() => void refreshTenant()} />;
  }

  return <Outlet />;
}

/** Gate for the auth pages. Signed-in users have no business on them. */
export function RequireGuest() {
  const { status } = useAuth();

  if (status === 'loading') return <SessionPending />;
  if (status === 'authenticated') return <Navigate to="/" replace />;

  return <Outlet />;
}
