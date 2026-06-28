import { useTranslations } from "next-intl";
import { z } from "zod";

export function useLoginSchema() {
  const t = useTranslations("login.errors");

  return z.object({
    email: z
      .string()
      .min(1, t("emailRequired"))
      .email(t("emailInvalid")),

    password: z
      .string()
      .min(1, t("passwordRequired"))
      .min(8, t("passwordMin")),
  });
}

export type LoginFormValues = z.infer<
  ReturnType<typeof useLoginSchema>
>;