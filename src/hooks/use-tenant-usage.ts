import { useQuery } from "@tanstack/react-query";
import { getTenantUsage } from "@/api/tenants";

export const TENANT_USAGE_KEY = ["tenant", "usage"];

/** The plan's limits next to current usage; null when it could not be loaded. */
export function useTenantUsage() {
  return useQuery({
    queryKey: TENANT_USAGE_KEY,
    queryFn: getTenantUsage,
    select: (result) => (result.ok ? result.value : null),
  });
}
