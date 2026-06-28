"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  HOME_ITEM,
  NAV_GROUPS,
  isActiveItem,
  type NavItem,
} from "./nav";

const STORAGE_KEY = "sidebarCollapsed";

function NavRow({
  item,
  collapsed,
  active,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
        collapsed ? "justify-center" : ""
      } ${
        active
          ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
      }`}
    >
      {item.icon}
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {typeof item.badge === "number" && (
            <span className="rounded-full bg-neutral-200 px-1.5 py-0.5 text-[11px] font-semibold text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
              {item.badge}
            </span>
          )}
          {item.stub && (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              Soon
            </span>
          )}
        </>
      )}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1",
  );

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <aside
      className={`no-print sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 flex-col border-r border-neutral-200 bg-white transition-[width] dark:border-neutral-800 dark:bg-neutral-950 lg:flex ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {/* Dashboard (ungrouped) */}
        <NavRow
          item={HOME_ITEM}
          collapsed={collapsed}
          active={isActiveItem(pathname, HOME_ITEM)}
        />

        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            {collapsed ? (
              <div className="mx-2 mb-1 border-t border-neutral-200 dark:border-neutral-800" />
            ) : (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                {group.label}
              </p>
            )}
            {group.items.map((item) => (
              <NavRow
                key={item.href}
                item={item}
                collapsed={collapsed}
                active={isActiveItem(pathname, item)}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggle}
        className="flex items-center gap-2 border-t border-neutral-200 px-4 py-3 text-xs font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700 dark:border-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg
          className={`h-4 w-4 shrink-0 transition-transform ${collapsed ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.6}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
}
