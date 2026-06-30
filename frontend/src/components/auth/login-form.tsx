"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { loginUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useLoginSchema } from "@/validations/login.schema";
import { useAuth } from "@/hooks/useAuth";


type LoginFormValues = {
  email: string;
  password: string;
};

export function LoginForm() {
  const t = useTranslations("login");
  const locale = useLocale();
  const router = useRouter();
  const schema = useLoginSchema();
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { login, user,isLoading } = useAuth();

  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginFormValues) {
    setServerError(null);

    try {
      await login(data);

      const redirect = searchParams.get("redirect");

      router.push(redirect ?? `/${locale}/jobs`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Something went wrong. Please try again.";

      setServerError(message);
    }
  }
  if(isLoading){
    return <></>
  }
  if (user) {
    router.push(`/${locale}/jobs`)
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {serverError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <FormField label={t("email")} error={errors.email?.message} required>
        <Input
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
          {...register("email")}
        />
      </FormField>

      <FormField label={t("password")} error={errors.password?.message} required>
        <div className="relative">
          <Input
            type={showPass ? "text" : "password"}
            autoComplete="current-password"
            placeholder={t("passwordPlaceholder")}
            className={cn(
              "pr-10",
              errors.password && "border-destructive focus-visible:ring-destructive"
            )}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPass ? "Hide password" : "Show password"}
          >
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </FormField>

      <Button type="submit" disabled={isSubmitting} size="lg" className="w-full mt-1">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("submitting")}
          </>
        ) : (
          t("submit")
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link
          href={`/${locale}/register`}
          className="font-medium text-primary underline-offset-4 hover:underline transition-colors"
        >
          {t("registerLink")}
        </Link>
      </p>
    </form>
  );
}
