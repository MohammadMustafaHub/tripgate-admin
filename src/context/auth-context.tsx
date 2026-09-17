import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  type LoginError,
  type LoginRequest,
  type RegisterError,
  type RegisterRequest,
} from '@/api/auth';
import { getAccessToken } from '@/api/client';
import { getCurrentUser } from '@/api/users';
import { fail, ok, type Result } from '@/lib/result';
import type { User } from '@/models/user';

/**
 * 'loading' is the window between mount and the first /me answer. Guards must
 * wait it out rather than treating it as signed out, or a refresh on any
 * protected page would bounce the user to the login screen.
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  login: (request: LoginRequest) => Promise<Result<User, LoginError>>;
  register: (request: RegisterRequest) => Promise<Result<User, RegisterError>>;
  logout: () => Promise<void>;
  /** Re-reads /me — call after something server-side changes the account. */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  // A stored token only means we can try — it may be expired or revoked, so the
  // session is confirmed by asking the API who we are.
  useEffect(() => {

    let cancelled = false;
    void getCurrentUser().then((result) => {
      if (cancelled) return;
      result.when(
        (value) => {
          setUser(value);
          setStatus('authenticated');
        },
        () => {
          setUser(null);
          setStatus('unauthenticated');
        }
      );
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (request: LoginRequest) => {
    const result = await loginRequest(request);
    if (!result.ok) return fail(result.error);

    // Tokens are stored, but the session is not usable until we know who the
    // user is. 'loading' puts the guards' spinner up for that window.
    setStatus('loading');

    const me = await getCurrentUser();
    if (!me.ok) {
      setStatus('unauthenticated');
      return fail<LoginError>('UNEXPECTED');
    }

    setUser(me.value);
    setStatus('authenticated');
    return ok(me.value);
  }, []);

  const register = useCallback(async (request: RegisterRequest) => {
    const result = await registerRequest(request);
    if (!result.ok) return fail(result.error);

    setStatus('loading');

    const me = await getCurrentUser();
    if (!me.ok) {
      setStatus('unauthenticated');
      return fail<RegisterError>('UNEXPECTED');
    }

    setUser(me.value);
    setStatus('authenticated');
    return ok(me.value);
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await getCurrentUser();
    me.when(
      (value) => {
        setUser(value);
        setStatus('authenticated');
      },
      () => {
        setUser(null);
        setStatus('unauthenticated');
      }
    );
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, register, logout, refreshUser }),
    [status, user, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return context;
}
