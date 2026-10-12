import {
  Building2Icon,
  ChartColumnIcon,
  LayoutDashboardIcon,
  MapIcon,
  SettingsIcon,
  TicketIcon,
  type LucideIcon,
} from "lucide-react";
import { Permission, hasPermission, isSystemAdmin } from "@/lib/permissions";

export interface NavLeaf {
  title: string;
  to: string;
  /** Breadcrumb titles for pages under `to`, keyed by the next path segment; "*" matches any id. */
  subPages?: Record<string, string>;
  /** Hidden from users without it; omit for pages every tenant member can open. */
  permission?: Permission;
}

export interface NavItem {
  title: string;
  icon: LucideIcon;
  /** Set for a direct link; omit when the item only groups `children`. */
  to?: string;
  /** Breadcrumb titles for pages under `to`, as on `NavLeaf`. */
  subPages?: Record<string, string>;
  children?: NavLeaf[];
  /** Hidden from users without it; omit for pages every tenant member can open. */
  permission?: Permission;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "عام",
    items: [
      { title: "الرئيسية", icon: LayoutDashboardIcon, to: "/" },
      {
        title: "الرحلات",
        icon: MapIcon,
        children: [
          {
            title: "البرامج السياحية",
            to: "/trip-programs",
            subPages: { new: "إضافة برنامج", "*": "تفاصيل البرنامج" },
          },
          {
            title: "الرحلات المجدولة",
            to: "/trips",
            subPages: { new: "جدولة رحلة", "*": "تفاصيل الرحلة" },
          },
        ],
      },
      { title: "الحجوزات", icon: TicketIcon, to: "/bookings", permission: Permission.ViewBookings },
      { title: "التحليلات", icon: ChartColumnIcon, to: "/analytics", permission: Permission.ViewStatistics },
    ],
  },
  {
    label: "الإدارة",
    items: [
      {
        title: "الإعدادات",
        icon: SettingsIcon,
        children: [
          { title: "المؤسسة", to: "/settings/tenant", subPages: { edit: "تعديل" } },
          {
            title: "الموظفون",
            to: "/settings/employees",
            subPages: { new: "إضافة موظف" },
            permission: Permission.ManageEmployees,
          },
        ],
      },
    ],
  },
];

/** Everything a system admin sees; none of the tenant pages are offered to them. */
export const SYSTEM_NAV_GROUPS: NavGroup[] = [
  {
    label: "النظام",
    items: [{ title: "المؤسسات", icon: Building2Icon, to: "/tenants", subPages: { "*": "تفاصيل المؤسسة" } }],
  },
];

/** The navigation with the entries `roles` cannot open removed, and groups left empty dropped. */
export function navGroupsFor(roles: readonly string[]): NavGroup[] {
  if (isSystemAdmin(roles)) return SYSTEM_NAV_GROUPS;
  const allowed = (entry: { permission?: Permission }) => !entry.permission || hasPermission(roles, entry.permission);
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items
      .filter(allowed)
      .map((item) => (item.children ? { ...item, children: item.children.filter(allowed) } : item))
      .filter((item) => !item.children || item.children.length > 0),
  })).filter((group) => group.items.length > 0);
}

/** Whether `pathname` is `to` itself or a page nested under it. */
export function isNavActive(pathname: string, to: string): boolean {
  return pathname === to || (to !== "/" && pathname.startsWith(`${to}/`));
}

/** Titles from the top-level item down to the page at `pathname`, for the breadcrumb. */
export function findNavTrail(pathname: string): string[] {
  for (const group of [...NAV_GROUPS, ...SYSTEM_NAV_GROUPS]) {
    for (const item of group.items) {
      if (item.to === pathname) return [item.title];
      if (item.to && item.to !== "/" && isNavActive(pathname, item.to)) {
        return subPageTrail(pathname, item.to, item.subPages, [item.title]);
      }
      const child = item.children?.find((c) => isNavActive(pathname, c.to));
      if (!child) continue;
      if (child.to === pathname) return [item.title, child.title];
      return subPageTrail(pathname, child.to, child.subPages, [item.title, child.title]);
    }
  }
  return [];
}

/** `trail` extended with the title of the page under `to` that `pathname` points at. */
function subPageTrail(
  pathname: string,
  to: string,
  subPages: Record<string, string> | undefined,
  trail: string[],
): string[] {
  const [segment, action] = pathname.slice(to.length + 1).split("/");
  const subTitle = subPages?.[segment] ?? subPages?.["*"];
  const full = subTitle ? [...trail, subTitle] : trail;
  return action === "edit" ? [...full, "تعديل"] : full;
}
