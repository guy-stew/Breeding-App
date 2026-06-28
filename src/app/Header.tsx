"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "./BrandLogo";
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
  initials,
  name,
  email,
}: {
  initials: string;
  name?: string | null;
  email?: string | null;
}) {
  const pathname = usePathname();
  const title = pageTitle(pathname);

  return (
    <header className="no-print sticky top-0 z-40 h-14 border-b border-slate-800 bg-slate-900 text-white">
      <div className="flex h-full items-center justify-between gap-3 px-3 sm:px-5">
        {/* WhelpWise wordmark + page title */}
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <Wordmark className="h-8 w-auto shrink-0" />
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
