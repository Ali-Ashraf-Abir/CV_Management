"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Role } from "@/types/profile";


const inputClass =
  "rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring";

interface ProfileDetailsFormProps {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  saving: boolean;
  onSave: (values: { firstName: string; lastName: string }) => void;
}

export function ProfileDetailsForm({
  firstName,
  lastName,
  email,
  role,
  saving,
  onSave,
}: ProfileDetailsFormProps) {
  const t = useTranslations("profile.details");
  const tRoles = useTranslations("profile.roles");
  const tValidation = useTranslations("profile.validation");

  const [values, setValues] = useState({ firstName, lastName });
  const [error, setError] = useState<string | null>(null);

  // Keep the form in sync if the profile reloads (e.g. after a photo change).
  useEffect(() => {
    setValues({ firstName, lastName });
  }, [firstName, lastName]);

  const isDirty = values.firstName !== firstName || values.lastName !== lastName;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedFirst = values.firstName.trim();
    const trimmedLast = values.lastName.trim();

    if (!trimmedFirst) {
      setError(tValidation("firstNameRequired"));
      return;
    }
    if (!trimmedLast) {
      setError(tValidation("lastNameRequired"));
      return;
    }

    onSave({ firstName: trimmedFirst, lastName: trimmedLast });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("firstName")} htmlFor="firstName">
          <input
            id="firstName"
            value={values.firstName}
            onChange={(e) => setValues((v) => ({ ...v, firstName: e.target.value }))}
            className={inputClass}
            autoComplete="given-name"
          />
        </Field>

        <Field label={t("lastName")} htmlFor="lastName">
          <input
            id="lastName"
            value={values.lastName}
            onChange={(e) => setValues((v) => ({ ...v, lastName: e.target.value }))}
            className={inputClass}
            autoComplete="family-name"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("email")} htmlFor="email" hint={t("emailHint")}>
          <input id="email" value={email} disabled className={`${inputClass} opacity-60`} />
        </Field>

        <Field label={t("role")} htmlFor="role">
          <span className={`${inputClass} flex items-center opacity-80`}>{tRoles(role)}</span>
        </Field>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!isDirty || saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? t("saving") : t("save")}
        </button>
        {!isDirty && <span className="text-sm text-muted-foreground">{t("noChanges")}</span>}
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}