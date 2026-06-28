import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/auth/login-form";
import { Briefcase } from "lucide-react";
import { ProtectedRoute } from "@/guards/ProtectedRoutes";

export default async function LoginPage() {
  const t = await getTranslations("login");

  return (
    <ProtectedRoute>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-accent">
        <h1 className="">this is an authenticated page</h1>
      </div>
    </ProtectedRoute>
  );
}
