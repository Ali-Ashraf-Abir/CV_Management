import { useTranslations } from "next-intl";
import z from "zod";

export function useRegisterSchema() {
  const t = useTranslations("register.errors");
  return z
    .object({
      firstName: z.string().min(1, t("firstNameRequired")),
      lastName: z.string().min(1, t("lastNameRequired")),
      email: z.string().min(1, t("emailRequired")).email(t("emailInvalid")),
      password: z
        .string()
        .min(1, t("passwordRequired"))
        .min(8, t("passwordMin"))
        .regex(/[A-Z]/, t("passwordUppercase"))
        .regex(/[0-9]/, t("passwordNumber")),
      confirmPassword: z.string().min(1, t("confirmRequired")),
      role: z.enum(["Candidate", "Recruiter"], { required_error: t("roleRequired") }),
    })
    .refine((d) => d.password === d.confirmPassword, {
      message: t("confirmMatch"),
      path: ["confirmPassword"],
    });
}