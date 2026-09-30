import { LayoutDashboardIcon, MapIcon, SettingsIcon, TicketIcon, type LucideIcon } from "lucide-react";

export interface NavLeaf {
  title: string;
  to: string;
  /** Breadcrumb titles for pages under `to`, keyed by the next path segment; "*" matches any id. */
  subPages?: Record<string, string>;
}

export interface NavItem {
  title: string;
  icon: LucideIcon;
  /** Set for a direct link; omit when the item only groups `children`. */
  to?: string;
  children?: NavLeaf[];
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
      { title: "الحجوزات", icon: TicketIcon, to: "/bookings" },
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
        ],
      },
    ],
  },
];

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
