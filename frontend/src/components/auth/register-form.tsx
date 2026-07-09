"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, UserRound, BriefcaseBusiness, Camera, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { registerUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRegisterSchema } from "@/validations/registration.schema";

type Role = "Candidate" | "Recruiter";

type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB, matches backend limit

export function RegisterForm() {
  const t = useTranslations("register");
  const locale = useLocale();
  const router = useRouter();
  const schema = useRegisterSchema();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "Candidate",
    },
  });

  const selectedRole = watch("role");

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);

    if (!file.type.startsWith("image/")) {
      setImageError(t("imageInvalidType"));
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError(t("imageTooLarge"));
      return;
    }

    setProfileImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function clearImage() {
    setProfileImage(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(data: RegisterFormValues) {
    setServerError(null);
    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("role", data.role);
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      await registerUser(formData);
      toast.success("Registration Successful Please Login");
      router.push(`/${locale}/login`);
    } catch (err) {
      console.error(err);
      setServerError("Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {serverError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {/* Profile image */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-accent text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {previewUrl ? (

              <img src={previewUrl} alt="Profile preview" className="h-full w-full object-cover" />
            ) : (
              <Camera className="h-6 w-6" />
            )}
          </button>
          {previewUrl && (
            <button
              type="button"
              onClick={clearImage}
              className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <span className="text-xs text-muted-foreground">{t("profileImageOptional")}</span>
        {imageError && <p className="text-xs text-destructive">{imageError}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">{t("role")}</span>
        <div className="grid grid-cols-2 gap-3">
          {(["Candidate", "Recruiter"] as Role[]).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setValue("role", role, { shouldValidate: true })}
              className={cn(
                "flex items-center gap-3 rounded-lg border-2 p-3 text-sm font-medium transition-all duration-150",
                selectedRole === role
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-border/80 hover:bg-accent"
              )}
            >
              {role === "Candidate" ? (
                <UserRound className="h-4 w-4 shrink-0" />
              ) : (
                <BriefcaseBusiness className="h-4 w-4 shrink-0" />
              )}
              {role === "Candidate" ? t("roleCandidate") : t("roleRecruiter")}
            </button>
          ))}
        </div>
        {errors.role && (
          <p className="text-xs text-destructive">{errors.role.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label={t("firstName")} error={errors.firstName?.message} required>
          <Input
            autoComplete="given-name"
            placeholder={t("firstNamePlaceholder")}
            className={cn(errors.firstName && "border-destructive focus-visible:ring-destructive")}
            {...register("firstName")}
          />
        </FormField>
        <FormField label={t("lastName")} error={errors.lastName?.message} required>
          <Input
            autoComplete="family-name"
            placeholder={t("lastNamePlaceholder")}
            className={cn(errors.lastName && "border-destructive focus-visible:ring-destructive")}
            {...register("lastName")}
          />
        </FormField>
      </div>

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
            autoComplete="new-password"
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
          >
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </FormField>

      <FormField label={t("confirmPassword")} error={errors.confirmPassword?.message} required>
        <div className="relative">
          <Input
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder={t("confirmPasswordPlaceholder")}
            className={cn(
              "pr-10",
              errors.confirmPassword && "border-destructive focus-visible:ring-destructive"
            )}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
        {t("hasAccount")}{" "}
        <Link
          href={`/${locale}/login`}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("loginLink")}
        </Link>
      </p>
    </form>
  );
}