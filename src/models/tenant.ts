export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  subscriptionType: "Free" | "Pro";
  subscriptionExpiresAt: string | null;
  hasActiveSubscription: boolean;
  createdAt: string;
}

