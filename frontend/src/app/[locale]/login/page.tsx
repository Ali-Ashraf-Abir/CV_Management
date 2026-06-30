import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/auth/login-form";
import { Briefcase } from "lucide-react";

export default async function LoginPage() {
  const t = await getTranslations("login");
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-border bg-card shadow-xl shadow-black/5 dark:shadow-black/20 p-8">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>

          <LoginForm />
        </div>

        {/* Bottom decoration */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
