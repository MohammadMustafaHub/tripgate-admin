import { hasPermission, type Permission } from "@/lib/permissions";
import { useUserStore } from "@/stores/user-store";

/** Whether the signed-in user's roles grant `permission`. */
export function usePermission(permission: Permission): boolean {
  return useUserStore((state) => hasPermission(state.user?.roles ?? [], permission));
}
