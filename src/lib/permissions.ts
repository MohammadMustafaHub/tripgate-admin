/** Role names as the API issues them. */
export const Role = {
  TenantAdmin: "tenantAdmin",
  Admin: "admin",
  TripProgramsManager: "tripProgramsManager",
  TripsManager: "tripsManager",
  BookingsViewer: "bookingsViewer",
  BookingsManager: "bookingsManager",
  StatisticsViewer: "statisticsViewer",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

/**
 * The API's authorization policies. Pages and actions not listed here only need tenant
 * membership, so every signed-in user of the tenant can use them.
 */
export const Permission = {
  ManageTripPrograms: "ManageTripPrograms",
  ManageTrips: "ManageTrips",
  ViewBookings: "ViewBookings",
  ManageBookings: "ManageBookings",
  ViewStatistics: "ViewStatistics",
  ManageEmployees: "ManageEmployees",
  ManageTenant: "ManageTenant",
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

// Mirrors the role lists documented on each endpoint in v1.yaml.
const PERMISSION_ROLES: Record<Permission, Role[]> = {
  ManageTripPrograms: [Role.TenantAdmin, Role.Admin, Role.TripProgramsManager],
  ManageTrips: [Role.TenantAdmin, Role.Admin, Role.TripsManager],
  ViewBookings: [Role.TenantAdmin, Role.Admin, Role.BookingsViewer, Role.BookingsManager],
  ManageBookings: [Role.TenantAdmin, Role.Admin, Role.BookingsManager],
  ViewStatistics: [Role.TenantAdmin, Role.Admin, Role.StatisticsViewer],
  ManageEmployees: [Role.TenantAdmin],
  ManageTenant: [Role.TenantAdmin],
};

export function hasPermission(roles: readonly string[], permission: Permission): boolean {
  return PERMISSION_ROLES[permission].some((role) => roles.includes(role));
}

export const ROLE_LABELS: Record<Role, string> = {
  tenantAdmin: "مدير المؤسسة",
  admin: "مشرف عام",
  tripProgramsManager: "إدارة برامج الرحلات",
  tripsManager: "إدارة الرحلات",
  bookingsViewer: "عرض الحجوزات",
  bookingsManager: "إدارة الحجوزات",
  statisticsViewer: "عرض التحليلات",
};

export const formatRole = (role: string) => ROLE_LABELS[role as Role] ?? role;

/** A short title for the user's position, for places that show a single label. */
export function formatRoleTitle(roles: readonly string[]): string {
  if (roles.includes(Role.TenantAdmin)) return ROLE_LABELS.tenantAdmin;
  if (roles.includes(Role.Admin)) return ROLE_LABELS.admin;
  return "موظف";
}
