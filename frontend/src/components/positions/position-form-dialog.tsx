"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { positionsApi } from "@/lib/api/position";
import { extractErrorMessage } from "@/lib/api";

import { PositionDto } from "@/types/position";
import { positionFormSchema, PositionFormValues } from "@/validations/position.schema";

interface PositionFormDialogProps {
  position?: PositionDto;
  onSaved: (position: PositionDto) => void;
  trigger?: React.ReactNode;
}

export function PositionFormDialog({ position, onSaved, trigger }: PositionFormDialogProps) {
  const t = useTranslations("positions");
  const [open, setOpen] = useState(false);
  const isEditing = Boolean(position);

  const form = useForm<PositionFormValues>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: {
      title: position?.title ?? "",
      description: position?.description ?? "",
      deadline: position?.deadline ? position.deadline.slice(0, 10) : "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: position?.title ?? "",
        description: position?.description ?? "",
        deadline: position?.deadline ? position.deadline.slice(0, 10) : "",
      });
    }
  }, [open, position, form]);

  async function onSubmit(values: PositionFormValues) {
    try {
      const deadline = values.deadline ? new Date(values.deadline).toISOString() : null;
      const saved = isEditing
        ? await positionsApi.update(position!.id, {
            title: values.title,
            description: values.description,
            deadline,
            version: position!.version,
          })
        : await positionsApi.create({
            title: values.title,
            description: values.description,
            deadline,
          });

      toast.success(isEditing ? t("positionUpdated") : t("positionCreated"));
      setOpen(false);
      onSaved(saved);
    } catch (err) {
      toast.error(extractErrorMessage(err, t("positionSaveError")));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button>{isEditing ? t("editPositionTitle") : t("newPositionTitle")}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? t("editPositionTitle") : t("createPositionTitle")}</DialogTitle>
          <DialogDescription>
            {isEditing ? t("editPositionDescription") : t("createPositionDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fieldTitleLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("fieldTitlePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fieldDescriptionLabel")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("fieldDescriptionPlaceholder")}
                      className="min-h-32 resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fieldDeadlineLabel")}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={form.formState.isSubmitting}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? t("saveChanges") : t("createPositionButton")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}