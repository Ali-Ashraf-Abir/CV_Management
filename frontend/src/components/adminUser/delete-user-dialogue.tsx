"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

import { ALL_ROLES, Roles, UserDto } from "@/types/users";
import { Modal } from "./modal";

type EditUserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  role: Roles;
  photoUrl: string;
};

function useEditUserSchema() {
  const t = useTranslations("adminUsers.validation");
  return z.object({
    firstName: z.string().min(1, t("firstNameRequired")),
    lastName: z.string().min(1, t("lastNameRequired")),
    email: z.string().min(1, t("emailRequired")).email(t("emailInvalid")),
    role: z.nativeEnum(Roles),
    photoUrl: z.string().optional().default(""),
  });
}

export function EditUserModal({
  user,
  open,
  onClose,
  onSave,
}: {
  user: UserDto | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, values: EditUserFormValues) => Promise<boolean>;
}) {
  const t = useTranslations("adminUsers");
  const schema = useEditUserSchema();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", email: "", role: Roles.Candidate, photoUrl: "" },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        photoUrl: user.photoUrl,
      });
    }
  }, [user, reset]);

  if (!user) return null;

  async function onSubmit(values: EditUserFormValues) {
    const ok = await onSave(user!.id, values);
    if (ok) onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={t("editModal.title")} description={t("editModal.description")}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label={t("fields.firstName")} error={errors.firstName?.message} required>
            <Input {...register("firstName")} />
          </FormField>
          <FormField label={t("fields.lastName")} error={errors.lastName?.message} required>
            <Input {...register("lastName")} />
          </FormField>
        </div>

        <FormField label={t("fields.email")} error={errors.email?.message} required>
          <Input type="email" {...register("email")} />
        </FormField>

        <FormField label={t("fields.role")} error={errors.role?.message} required>
          <select
            {...register("role")}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {ALL_ROLES.map((role) => (
              <option key={role} value={role}>
                {t(`roles.${role}`)}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label={t("fields.photoUrl")} error={errors.photoUrl?.message}>
          <Input placeholder={t("fields.photoUrlPlaceholder")} {...register("photoUrl")} />
        </FormField>

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("actions.cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("actions.saving")}
              </>
            ) : (
              t("actions.save")
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}