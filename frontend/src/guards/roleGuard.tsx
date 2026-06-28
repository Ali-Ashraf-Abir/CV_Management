"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import type { UserRole } from "@/types/auth";
import { useAuth } from "@/hooks/useAuth";

interface RoleGuardProps {
  roles: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({
  roles,
  children,
}: RoleGuardProps) {
  const {
    user,
    isAuthenticated,
    isLoading,
  } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (
      !isLoading &&
      isAuthenticated &&
      user &&
      !roles.includes(user.role)
    ) {
      router.replace("/403");
    }
  }, [
    isLoading,
    isAuthenticated,
    user,
    roles,
    router,
  ]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  if (!roles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}