import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { getCurrentTenant } from '@/api/tenants';
import { useAuth } from '@/context/auth-context';
import type { Tenant } from '@/models/tenant';

/**
 * 'idle'    — nobody to ask about yet (signed out, or phone not confirmed)
 * 'missing' — the account has no tenant and must create one
 * 'error'   — the lookup failed; not the same as having no tenant
 */
export type TenantStatus =
  | 'idle'
  | 'loading'
  | 'present'
  | 'missing'
  | 'error';

interface TenantContextValue {
  status: TenantStatus;
  tenant: Tenant | null;
  /** Records a tenant the client just created, without a second round trip. */
  setTenant: (tenant: Tenant) => void;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { status: authStatus, user } = useAuth();
  const [tenant, setTenantState] = useState<Tenant | null>(null);
  const [status, setStatus] = useState<TenantStatus>('idle');

  // The tenant endpoint needs a confirmed account, so this deliberately waits
  // for the verification step to pass before asking.
  const canQuery =
    authStatus === 'authenticated' && user?.phoneNumberConfirmed === true;

  useEffect(() => {
    if (!canQuery) {
      setTenantState(null);
      setStatus('idle');
      return;
    }

    let cancelled = false;
    setStatus('loading');

    void getCurrentTenant().then((result) => {
      if (cancelled) return;
      result.when(
        (value) => {
          setTenantState(value);
          setStatus('present');
        },
        (error) => {
          setTenantState(null);
          setStatus(error === 'NO_TENANT' ? 'missing' : 'error');
        }
      );
    });

    return () => {
      cancelled = true;
    };
  }, [canQuery]);

  const refreshTenant = useCallback(async () => {
    setStatus('loading');
    const result = await getCurrentTenant();
    result.when(
      (value) => {
        setTenantState(value);
        setStatus('present');
      },
      (error) => {
        setTenantState(null);
        setStatus(error === 'NO_TENANT' ? 'missing' : 'error');
      }
    );
  }, []);

  const setTenant = useCallback((value: Tenant) => {
    setTenantState(value);
    setStatus('present');
  }, []);

  const value = useMemo<TenantContextValue>(
    () => ({ status, tenant, setTenant, refreshTenant }),
    [status, tenant, setTenant, refreshTenant]
  );

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used inside a <TenantProvider>');
  }
  return context;
}
