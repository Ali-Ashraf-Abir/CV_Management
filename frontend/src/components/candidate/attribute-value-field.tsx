"use client";

import { Control } from "react-hook-form";
import { AlertTriangle, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";

import { PositionRequirementDto } from "@/types/position";

import { CandidateProfileValues } from "./candidate-position-cv";
import { formatRequirementRule } from "@/lib/utils/requirement-format";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { AttributeDto } from "@/types/attribute";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function AttributeValueField({
  control,
  requirement,
  isPrefilled,
  staleValue,
  dropdownAttribute,
}: {
  control: Control<CandidateProfileValues>;
  requirement: PositionRequirementDto;
  isPrefilled?: boolean;
  staleValue?: string;
  dropdownAttribute?: AttributeDto;
}) {
  const t = useTranslations("cv");
  const name = `values.${requirement.id}` as const;
  const rule = formatRequirementRule(requirement);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-baseline justify-between gap-2">
            <FormLabel className="text-sm font-medium text-foreground">
              {requirement.attributeTitle}
            </FormLabel>
            {isPrefilled && !staleValue && (
              <Badge
                variant="secondary"
                className="gap-1 whitespace-nowrap bg-primary/10 font-normal text-primary hover:bg-primary/10"
              >
                <Sparkles className="size-3" />
                {t("fromProfile")}
              </Badge>
            )}
          </div>

          <FormControl>
            <FieldControl
              requirement={requirement}
              value={field.value}
              onChange={field.onChange}
              dropdownAttribute={dropdownAttribute}
            />
          </FormControl>

          {staleValue && (
            <div className="flex items-start gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 size-3 shrink-0" />
              <span>{t("staleValueWarning", { value: staleValue })}</span>
            </div>
          )}

          {rule && <p className="text-xs text-muted-foreground">{rule}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldControl({
  requirement,
  value,
  onChange,
  dropdownAttribute,
}: {
  requirement: PositionRequirementDto;
  value: string;
  onChange: (v: string) => void;
  dropdownAttribute?: AttributeDto;
}) {
  const t = useTranslations("cv");

  switch (requirement.attributeType) {
    case "Numeric":
      return (
        <Input
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "Date":
    case "Period":
      return <Input type="date" value={value} onChange={(e) => onChange(e.target.value)} />;
    case "Boolean":
      return (
        <ToggleGroup
          type="single"
          value={value}
          onValueChange={(v) => v && onChange(v)}
          className="justify-start"
        >
          <ToggleGroupItem value="true" className="min-w-20">
            {t("yes")}
          </ToggleGroupItem>
          <ToggleGroupItem value="false" className="min-w-20">
            {t("no")}
          </ToggleGroupItem>
        </ToggleGroup>
      );
    case "Text":
      return (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-24 resize-y"
        />
      );
    case "Dropdown":
      return (
        <Select value={value} onValueChange={onChange}>
          <FormControl>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("chooseOption")} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {!dropdownAttribute && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                {t("loadingOptions")}
              </div>
            )}
            {dropdownAttribute && dropdownAttribute.values.length === 0 && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                {t("noOptionsAvailable")}
              </div>
            )}
            {dropdownAttribute?.values.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    default:
      return <Input value={value} onChange={(e) => onChange(e.target.value)} />;
  }
}