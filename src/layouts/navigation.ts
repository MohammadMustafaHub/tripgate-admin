import { ChartColumnIcon, LayoutDashboardIcon, MapIcon, SettingsIcon, TicketIcon, type LucideIcon } from "lucide-react";
import { Permission, hasPermission } from "@/lib/permissions";

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
            title: "برامج الرحلات",
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
          { title: "المؤسسة", to: "/settings/tenant" },
          { title: "الحساب", to: "/settings/account" },
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

/** The navigation with the entries `roles` cannot open removed, and groups left empty dropped. */
export function navGroupsFor(roles: readonly string[]): NavGroup[] {
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
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (item.to === pathname) return [item.title];
      const child = item.children?.find((c) => isNavActive(pathname, c.to));
      if (!child) continue;
      if (child.to === pathname) return [item.title, child.title];
      const [segment, action] = pathname.slice(child.to.length + 1).split("/");
      const subTitle = child.subPages?.[segment] ?? child.subPages?.["*"];
      const trail = subTitle ? [item.title, child.title, subTitle] : [item.title, child.title];
      return action === "edit" ? [...trail, "تعديل"] : trail;
    }
  }
  return [];
}
