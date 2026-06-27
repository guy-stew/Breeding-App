// Helper: get the Breeder record for the currently logged-in user.
//
// Lookup order:
//  1. By supabaseUserId (fast path — already linked).
//  2. By email match (first login — links the account automatically).
//  3. No match at all — creates a fresh Breeder record.

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function getBreeder() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Already linked?
  let breeder = await prisma.breeder.findFirst({
    where: { supabaseUserId: user.id, deletedAt: null },
  });
  if (breeder) return breeder;

  // 2. Email match — link the existing record to this auth account.
  if (user.email) {
    breeder = await prisma.breeder.findFirst({
      where: { email: user.email, deletedAt: null },
    });
    if (breeder) {
      await prisma.breeder.update({
        where: { id: breeder.id },
        data: { supabaseUserId: user.id },
      });
      return breeder;
    }
  }

  // 3. Brand-new user — create a Breeder for them.
  breeder = await prisma.breeder.create({
    data: {
      supabaseUserId: user.id,
      name: user.email?.split("@")[0] ?? "New Breeder",
      email: user.email,
    },
  });

  return breeder;
}
