"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

export default function AppShell({
  children,
  initials,
  name,
  email,
}: {
  children: React.ReactNode;
  initials: string;
  name?: string | null;
  email?: string | null;
}) {
  const pathname = usePathname();

  // Don't show the shell on login, marketplace, or print pages.
  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/marketplace") ||
    pathname.includes("/contract") ||
    pathname.includes("/info-pack");

  if (isPublic) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col">
      <Header initials={initials} name={name} email={email} />

      <div className="flex flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</main>
      </div>

      <BottomNav />
    </div>
  );
}
