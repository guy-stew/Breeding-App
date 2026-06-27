import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import AppShell from "./AppShell";

async function getKennelName(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const breeder = await prisma.breeder.findFirst({
      where: { supabaseUserId: user.id },
      select: { kennelName: true },
    });
    return breeder?.kennelName ?? null;
  } catch {
    return null;
  }
}

export default async function AppShellWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const kennelName = await getKennelName();
  return <AppShell kennelName={kennelName}>{children}</AppShell>;
}
