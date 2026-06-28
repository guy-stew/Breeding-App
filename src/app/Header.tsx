"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SettingsMenu from "./SettingsMenu";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import { HOME_ITEM, NAV_GROUPS } from "./nav";

// Friendly page title shown next to the logo (breadcrumb-style).
function pageTitle(pathname: string): string {
  if (pathname === "/") return HOME_ITEM.label;
  const all = NAV_GROUPS.flatMap((g) => g.items);
  const match = all
    .filter((i) => pathname.startsWith(i.match ?? i.href) && i.href !== "/")
    .sort((a, b) => (b.match ?? b.href).length - (a.match ?? a.href).length)[0];
  if (match) return match.label;
  // Fallback: title-case the first path segment.
  const seg = pathname.split("/").filter(Boolean)[0] ?? "";
  return seg ? seg.charAt(0).toUpperCase() + seg.slice(1) : "";
}

export default function Header({
  kennelName,
  initials,
  name,
  email,
}: {
  kennelName?: string | null;
  initials: string;
  name?: string | null;
  email?: string | null;
}) {
  const pathname = usePathname();
  const title = pageTitle(pathname);

  return (
    <header className="no-print sticky top-0 z-40 h-14 border-b border-slate-800 bg-slate-900 text-white">
      <div className="flex h-full items-center justify-between gap-3 px-3 sm:px-5">
        {/* Logo + kennel name + page title */}
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.5 11a2 2 0 100-4 2 2 0 000 4zm13 0a2 2 0 100-4 2 2 0 000 4zM9 7.5a2 2 0 100-4 2 2 0 000 4zm6 0a2 2 0 100-4 2 2 0 000 4zm-3 2.5c-2.4 0-4.5 2.2-4.9 4.2-.3 1.6 1 2.8 2.6 2.8.9 0 1.6-.4 2.3-.4s1.4.4 2.3.4c1.6 0 2.9-1.2 2.6-2.8C16.5 12.2 14.4 10 12 10z" />
            </svg>
          </span>
          <span className="truncate text-base font-semibold tracking-tight">
            {kennelName || "Breeding App"}
          </span>
          {title && (
            <>
              <span className="hidden text-slate-600 sm:inline">/</span>
              <span className="hidden truncate text-sm font-medium text-slate-300 sm:inline">
                {title}
              </span>
            </>
          )}
        </Link>

        {/* Right-side controls */}
        <div className="flex items-center gap-1">
          <SettingsMenu />
          <ThemeToggle />
          <div className="ml-1">
            <UserMenu initials={initials} name={name} email={email} />
          </div>
        </div>
      </div>
    </header>
  );
}
