"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

const inputClass =
  "rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition focus:outline-none focus:ring-2 focus:ring-ring";

interface ChangePasswordFormProps {
  submitting: boolean;
  onSubmit: (values: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => Promise<void> | void;
}

const EMPTY_VALUES = { currentPassword: "", newPassword: "", confirmNewPassword: "" };

export function ChangePasswordForm({ submitting, onSubmit }: ChangePasswordFormProps) {
  const t = useTranslations("profile.security");
  const tValidation = useTranslations("profile.validation");

  const [values, setValues] = useState(EMPTY_VALUES);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!values.currentPassword) {
      setError(tValidation("currentPasswordRequired"));
      return;
    }
    if (!values.newPassword) {
      setError(tValidation("newPasswordRequired"));
      return;
    }
    if (values.newPassword.length < 8) {
      setError(tValidation("newPasswordMinLength"));
      return;
    }
    if (values.newPassword !== values.confirmNewPassword) {
      setError(tValidation("passwordsMustMatch"));
      return;
    }

    await onSubmit(values);
    setValues(EMPTY_VALUES);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{t("description")}</p>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="currentPassword" className="text-sm font-medium text-foreground">
          {t("currentPassword")}
        </label>
        <input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          value={values.currentPassword}
          onChange={(e) => setValues((v) => ({ ...v, currentPassword: e.target.value }))}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="newPassword" className="text-sm font-medium text-foreground">
            {t("newPassword")}
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            value={values.newPassword}
            onChange={(e) => setValues((v) => ({ ...v, newPassword: e.target.value }))}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmNewPassword" className="text-sm font-medium text-foreground">
            {t("confirmNewPassword")}
          </label>
          <input
            id="confirmNewPassword"
            type="password"
            autoComplete="new-password"
            value={values.confirmNewPassword}
            onChange={(e) => setValues((v) => ({ ...v, confirmNewPassword: e.target.value }))}
            className={inputClass}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? t("submitting") : t("submit")}
        </button>
      </div>
    </form>
  );
}