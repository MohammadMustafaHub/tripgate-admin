import { useQuery } from "@tanstack/react-query";
import { getCurrentTenant } from "@/api/tenants";

export function useCurrentTenant() {
  return useQuery({
    queryKey: ["tenant", "current"],
    queryFn: getCurrentTenant,
    select: (result) => (result.ok ? result.value : null),
  });
}
