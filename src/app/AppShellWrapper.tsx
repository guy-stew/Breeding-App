import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import AppShell from "./AppShell";

function initialsFrom(source: string): string {
  const parts = source.trim().split(/[\s@._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

async function getShellData() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const breeder = await prisma.breeder.findFirst({
      where: { supabaseUserId: user.id, deletedAt: null },
      select: { kennelName: true, name: true, email: true },
    });

    const name = breeder?.name ?? user.email?.split("@")[0] ?? null;
    const email = breeder?.email ?? user.email ?? null;
    const initials = initialsFrom(breeder?.kennelName || name || email || "?");

    return {
      kennelName: breeder?.kennelName ?? null,
      name,
      email,
      initials,
    };
  } catch {
    return null;
  }
}

export default async function AppShellWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getShellData();
  return (
    <AppShell name={data?.name} email={data?.email} initials={data?.initials ?? "?"}>
      {children}
    </AppShell>
  );
}
