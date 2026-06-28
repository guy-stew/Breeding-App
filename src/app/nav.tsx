// Shared navigation config — single source of truth for the desktop sidebar
// and the mobile bottom tab bar. Grouped into KENNEL / WHELPING / MARKETING
// to match the desktop design.

import type { ReactNode } from "react";

export type NavItem = {
  href: string;
  label: string;
  /** Path prefix used to decide the active state (defaults to href). */
  match?: string;
  /** Optional count badge (e.g. number of dogs). */
  badge?: number;
  /** Marks a destination that isn't fully built yet. */
  stub?: boolean;
  icon: ReactNode;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

const ic = (path: ReactNode) => (
  <svg
    className="h-5 w-5 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.6}
    stroke="currentColor"
  >
    {path}
  </svg>
);

// --- Icons -----------------------------------------------------------------

export const HomeIcon = ic(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
  />,
);

const DogIcon = ic(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm5.25 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75z"
  />,
);

const SeasonIcon = ic(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
  />,
);

const MatingIcon = ic(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
  />,
);

const LitterIcon = ic(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
  />,
);

const GrowthIcon = ic(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
  />,
);

const BuyerIcon = ic(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
  />,
);

const ContractIcon = ic(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
  />,
);

const ListingIcon = ic(
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .415.336.75.75.75z"
  />,
);

// --- Nav structure ---------------------------------------------------------

/** Top-level item shown above the groups. */
export const HOME_ITEM: NavItem = {
  href: "/",
  label: "Dashboard",
  icon: HomeIcon,
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Kennel",
    items: [
      { href: "/dogs", label: "Dogs", match: "/dogs", icon: DogIcon },
      { href: "/seasons", label: "Seasons", icon: SeasonIcon },
      { href: "/matings", label: "Matings", icon: MatingIcon },
    ],
  },
  {
    label: "Whelping",
    items: [
      { href: "/litters/new", label: "Litters", match: "/litters", icon: LitterIcon },
      { href: "/growth", label: "Growth", icon: GrowthIcon },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/buyers", label: "Buyers", icon: BuyerIcon },
      { href: "/contracts", label: "Contracts", icon: ContractIcon },
      { href: "/listings", label: "Listings", icon: ListingIcon },
    ],
  },
];

/** Compact set for the mobile bottom tab bar. */
export const BOTTOM_NAV: NavItem[] = [
  HOME_ITEM,
  { href: "/dogs", label: "Dogs", match: "/dogs", icon: DogIcon },
  { href: "/litters/new", label: "Litters", match: "/litters", icon: LitterIcon },
  { href: "/buyers", label: "Buyers", icon: BuyerIcon },
  { href: "/listings", label: "Listings", icon: ListingIcon },
];

/** True when the current pathname belongs to the given nav item. */
export function isActiveItem(pathname: string, item: NavItem): boolean {
  if (item.href === "/") return pathname === "/";
  return pathname.startsWith(item.match ?? item.href);
}
