"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Pencil } from "lucide-react";

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
import { ALLOWED_OPERATORS_BY_TYPE, PositionRequirementDto } from "@/types/position";
import { AttributeSummaryDto } from "@/types/attribute";
import { RequirementValueFields } from "./requirement-value-fields";
import { buildRequirementSchema, RequirementFormValues } from "@/validations/requirement.schema";
import { positionRequirementsApi } from "@/lib/api/positionRequirement";

type RequirementFormDialogProps =
  | {
    mode: "add";
    positionId: string;
    existingAttributeIds: string[];
    onSaved: (requirement: PositionRequirementDto) => void;
  }
  | {
    mode: "edit";
    positionId: string;
    requirement: PositionRequirementDto;
    onSaved: (requirement: PositionRequirementDto) => void;
  };

export function RequirementFormDialog(props: RequirementFormDialogProps) {
  const { mode, positionId, onSaved } = props;
  const [open, setOpen] = useState(false);
  const [attributes, setAttributes] = useState<AttributeSummaryDto[] | null>(null);

  useEffect(() => {
    if (open && mode === "add" && attributes === null) {
      attributesApi
        .listFilterable()
        .then(setAttributes)
        .catch((err) => toast.error(extractErrorMessage(err, "Couldn't load attributes")));
    }
  }, [open, mode, attributes]);

  const availableAttributes = useMemo(() => {
    if (mode !== "add" || !attributes) return [];
    return attributes.filter((a) => !props.existingAttributeIds.includes(a.id));
  }, [attributes, mode, props]);
  console.log(attributes)
  console.log(availableAttributes)
  const form = useForm<RequirementFormValues>({
    defaultValues:
      mode === "edit"
        ? {
          attributeId: props.requirement.attributeId,
          operator: props.requirement.operator,
          value: props.requirement.value ?? "",
          secondValue: props.requirement.secondValue ?? "",
        }
        : { attributeId: "", operator: "", value: "", secondValue: "" },
  });

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
    return attributes?.find((a) => a.id === attributeId) ?? null;
  }, [mode, props, attributes, attributeId]);

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
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        form.setError(issue.path[0] as keyof RequirementFormValues, { message: issue.message });
      });
      return;
    }

    try {
      const payload = {
        operator: values.operator as PositionRequirementDto["operator"],
        value: values.value,
        secondValue: values.operator === "Between" ? values.secondValue : undefined,
      };

      const saved =
        mode === "add"
          ? await positionRequirementsApi.add(positionId, {
            attributeId: values.attributeId,
            ...payload,
          })
          : await positionRequirementsApi.update(positionId, props.requirement.id, {
            ...payload,
            version: props.requirement.version,
          });

      toast.success(mode === "add" ? "Requirement added" : "Requirement updated");
      setOpen(false);
      onSaved(saved);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't save the requirement"));
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
            Add requirement
          </Button>
        ) : (
          <Button variant="ghost" size="icon">
            <Pencil className="size-4" />
            <span className="sr-only">Edit requirement</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add a requirement" : "Edit requirement"}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Pick an attribute and the rule candidates must satisfy."
              : `Editing the rule for "${props.requirement.attributeTitle}".`}
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
                    <FormLabel>Attribute</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose an attribute" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {attributes === null && (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading...</div>
                        )}
                        {attributes !== null && availableAttributes.length === 0 && (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No more filterable attributes available.
                          </div>
                        )}
                        {availableAttributes.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedAttribute && (
              <FormField
                control={form.control}
                name="operator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operator</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose an operator" />
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
            )}

            {selectedAttribute && operator && (
              <RequirementValueFields
                control={form.control}
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
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || !selectedAttribute}
              >
                {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {mode === "add" ? "Add requirement" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
