export interface User {
  id: string;
  phoneNumber: string;
  phoneNumberConfirmed: boolean;
  roles: string[];
  tenantId: string | null;
}
