"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { toast } from "sonner";
import { Loader2, Plus, Pencil } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { attributesApi } from "@/lib/api/attributes";

import { extractErrorMessage } from "@/lib/api";

import { OPERATOR_LABEL } from "@/lib/constants/requirement-operator";
import { ALLOWED_OPERATORS_BY_TYPE, PositionRequirementDto, RequirementOperator } from "@/types/position";
import { AttributeDto, AttributeSummaryDto, PagedResultDto } from "@/types/attribute";
import { RequirementValueFields } from "./requirement-value-fields";
import { AttributeCombobox } from "./attribute-combobox";
import { buildRequirementSchema, RequirementFormValues } from "@/validations/requirement.schema";
import { positionRequirementsApi } from "@/lib/api/positionRequirement";
import { Checkbox } from "../ui/checkbox";

type RequirementFormDialogProps =
  | {
    mode: "add";
    positionId: string;
    hasRequirement: boolean;
    existingAttributeIds: string[];
    onSaved: (requirement: PositionRequirementDto) => void;
  }
  | {
    mode: "edit";
    positionId: string;
    hasRequirement: boolean;
    requirement: PositionRequirementDto;
    onSaved: (requirement: PositionRequirementDto) => void;
  };

export function RequirementFormDialog(props: RequirementFormDialogProps) {
  const t = useTranslations("positions");
  const { mode, positionId, onSaved } = props;
  const [open, setOpen] = useState(false);
  const [attributes, setAttributes] = useState<PagedResultDto<AttributeSummaryDto> | null>(null);
  const [attributeDetails, setAttributeDetials] = useState<AttributeDto | null>(null);
  useEffect(() => {
    if (open && mode === "add" && attributes === null) {
      attributesApi
        .listFilterable()
        .then(setAttributes)
        .catch((err) => toast.error(extractErrorMessage(err, t("loadAttributesError"))));
    }
  }, [open, mode, attributes, t]);

  const availableAttributes = useMemo(() => {
    if (mode !== "add" || !attributes) return [];
    return attributes.items.filter((a) => !props.existingAttributeIds.includes(a.id));
  }, [attributes, mode, props]);

  const form = useForm<RequirementFormValues>({
    defaultValues:
      mode === "edit"
        ? {
          attributeId: props.requirement.attributeId,
          operator: props.requirement.operator,
          value: props.requirement.value ?? "",
          hasRequirement: props.hasRequirement || false,
          secondValue: props.requirement.secondValue ?? "",
        }
        : { attributeId: "", operator: "", value: "", secondValue: "", hasRequirement: false },
  });
  const hasRequirement = form.watch("hasRequirement");
  const attributeId = form.watch("attributeId");
  const operator = form.watch("operator");
  const selectedAttribute: AttributeSummaryDto | null = useMemo(() => {
    if (mode === "edit") {
      return {
        id: props.requirement.attributeId,
        title: props.requirement.attributeTitle,
        category: props.requirement.attributeCategory,
        type: props.requirement.attributeType,
        isFilterable: true,
        values: [],
      };
    }
    return attributes?.items.find((a) => a.id === attributeId) ?? null;
  }, [mode, props, attributes, attributeId]);
  useEffect(() => {
    if (selectedAttribute) {
      attributesApi.getById(selectedAttribute.id).then(setAttributeDetials)
    }
  }, [selectedAttribute])
  useEffect(() => {
    if (attributeDetails && selectedAttribute) {
      selectedAttribute.values = attributeDetails.values
    }
  }, [attributeDetails])
  // Re-validate against the freshly selected attribute's rules on every change.
  const schema = useMemo(() => buildRequirementSchema(selectedAttribute), [selectedAttribute]);

  useEffect(() => {
    form.clearErrors();
    // Reset operator when the attribute changes in add mode (new type -> new allowed ops).
    if (mode === "add") {
      form.setValue("operator", "");
      form.setValue("value", "");
      form.setValue("secondValue", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributeId]);

  async function onSubmit(values: RequirementFormValues) {
    console.log(values)
    const parsed = schema.safeParse(values);
    console.log('hit', parsed)
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        form.setError(issue.path[0] as keyof RequirementFormValues, { message: issue.message });
      });
      return;
    }

    try {
      const payload = values.hasRequirement
        ? {
          attributeId: values.attributeId,
          hasRequirement: true,
          operator: values.operator as RequirementOperator,
          value: values.value,
          secondValue: values.secondValue || undefined,
        }
        : {
          attributeId: values.attributeId,
          hasRequirement: false,
          operator: undefined,
          value: undefined,
          secondValue: undefined,
        };

      const saved =
        mode === "add"
          ? await positionRequirementsApi.add(positionId, {

            ...payload,
          })
          : await positionRequirementsApi.update(positionId, props.requirement.id, {
            ...payload,
            version: props.requirement.version,
          });

      toast.success(mode === "add" ? t("requirementAdded") : t("requirementUpdated"));
      setOpen(false);
      onSaved(saved);
    } catch (err) {
      toast.error(extractErrorMessage(err, t("requirementSaveError")));
    }
  }

  const allowedOperators = selectedAttribute
    ? ALLOWED_OPERATORS_BY_TYPE[selectedAttribute.type]
    : [];

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) form.reset();
      }}
    >
      <DialogTrigger asChild>
        {mode === "add" ? (
          <Button size="sm">
            <Plus className="size-4" />
            {t("addRequirementButton")}
          </Button>
        ) : (
          <Button variant="ghost" size="icon">
            <Pencil className="size-4" />
            <span className="sr-only">{t("editRequirementSr")}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? t("addRequirementTitle") : t("editRequirementTitle")}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? t("addRequirementDescription")
              : t("editRequirementDescription", { title: props.requirement.attributeTitle })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {mode === "add" && (
              <FormField
                control={form.control}
                name="attributeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("attributeLabel")}</FormLabel>
                    <FormControl>
                      <AttributeCombobox
                        attributes={availableAttributes}
                        value={field.value}
                        onChange={field.onChange}
                        isLoading={attributes === null}
                        emptyText={
                          attributes !== null && availableAttributes.length === 0
                            ? t("noMoreAttributes")
                            : t("noAttributesMatch")
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {
              selectedAttribute && (
                <FormField
                  control={form.control}
                  name="hasRequirement"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            const value = checked === true;
                            field.onChange(value);

                          }}
                        />
                      </FormControl>

                      <FormLabel>{t("hasRequirementLabel")}</FormLabel>
                    </FormItem>
                  )}
                />
              )
            }
            {hasRequirement && (
              <div className="">

                <FormField
                  control={form.control}
                  name="operator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("operatorLabel")}</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("operatorPlaceholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allowedOperators.map((op) => (
                            <SelectItem key={op} value={op}>
                              {OPERATOR_LABEL[op]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />


                    </FormItem>
                  )}
                />
              </div>
            )}

            {selectedAttribute && operator && (
              <RequirementValueFields
                control={form.control}
                attributeDetails={attributeDetails}
                attribute={selectedAttribute}
                operator={operator}
              />

            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={form.formState.isSubmitting}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || !selectedAttribute}
              >
                {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {mode === "add" ? t("addRequirementButton") : t("saveChanges")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}