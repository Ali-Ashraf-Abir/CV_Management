"use client";

import { ProtectedRoute } from "@/guards/ProtectedRoutes";
import { RoleGuard } from "@/guards/roleGuard";


export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <RoleGuard roles={["Recruiter"]}>
        {children}
      </RoleGuard>
    </ProtectedRoute>
  );
}