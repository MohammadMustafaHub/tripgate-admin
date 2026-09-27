import { create } from "zustand";
import { onSessionExpired } from "@/api/client";
import { revokeToken } from "@/api/tokens";
import { tokenStorage } from "@/api/tokens-storage";
import { getCurrentUser } from "@/api/user";
import { queryClient } from "@/lib/query-client";
import type { Tokens } from "@/models/auth";
import type { User } from "@/models/user";

type SessionStatus = "idle" | "loading" | "ready" | "error";

// Where the user is in the onboarding flow, in order.
export type AuthStep = "login" | "verify" | "tenant" | "ready";

interface UserState {
  user: User | null;
  status: SessionStatus;
  /** Fetches the current user. Only the first load shows the loading state. */
  load: () => Promise<void>;
  /** Stores a freshly issued token pair and reloads the user. */
  signIn: (tokens: Tokens) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  status: "idle",

  async load() {
    if (get().status === "loading") return;
    if (!tokenStorage.getAccessToken() && !tokenStorage.getRefreshToken()) {
      set({ user: null, status: "ready" });
      return;
    }
    if (get().status !== "ready") set({ status: "loading" });

    const result = await getCurrentUser();
    if (result.ok) {
      set({ user: result.value, status: "ready" });
    } else if (result.error === "UNAUTHORIZED") {
      tokenStorage.clear();
      set({ user: null, status: "ready" });
    } else {
      set({ status: "error" });
    }
  },

  async signIn(tokens) {
    tokenStorage.set(tokens);
    await get().load();
  },

  async signOut() {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) await revokeToken({ refreshToken });
    tokenStorage.clear();
    queryClient.clear();
    set({ user: null, status: "ready" });
  },
}));

onSessionExpired(() => {
  queryClient.clear();
  useUserStore.setState({ user: null, status: "ready" });
});

export function getAuthStep(user: User | null): AuthStep {
  if (!user) return "login";
  if (!user.phoneNumberConfirmed) return "verify";
  if (!user.tenantId) return "tenant";
  return "ready";
}

export const useAuthStep = () => useUserStore((state) => getAuthStep(state.user));
