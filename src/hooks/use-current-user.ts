"use client";

import { useSession } from "next-auth/react";
import type { AuthUser } from "@/types";

export function useCurrentUser(): AuthUser | null {
  const { data: session } = useSession();
  if (!session?.user) return null;

  const user = session.user as AuthUser;
  return user;
}
