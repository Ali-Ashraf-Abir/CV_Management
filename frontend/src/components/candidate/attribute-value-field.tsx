"use client";

import { Control } from "react-hook-form";
import { Sparkles } from "lucide-react";


import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";

import { PositionRequirementDto } from "@/types/position";

import { CandidateProfileValues } from "./candidate-position-cv";
import { formatRequirementRule } from "@/lib/utils/requirement-format";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

export function AttributeValueField({
  control,
  requirement,
  isPrefilled,
}: {
  control: Control<CandidateProfileValues>;
  requirement: PositionRequirementDto;
  isPrefilled?: boolean;
}) {
  const name = `values.${requirement.id}` as const;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between gap-2">
            <FormLabel>{requirement.attributeTitle}</FormLabel>
            {isPrefilled && (
              <Badge variant="secondary" className="gap-1 font-normal">
                <Sparkles className="size-3" />
                From your profile
              </Badge>
            )}
          </div>
          <FormControl>
            <FieldControl requirement={requirement} value={field.value} onChange={field.onChange} />
          </FormControl>
          <p className="text-xs text-muted-foreground">
            Requirement: {formatRequirementRule(requirement)}
          </p>
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
}: {
  requirement: PositionRequirementDto;
  value: string;
  onChange: (v: string) => void;
}) {
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
          <ToggleGroupItem value="true">Yes</ToggleGroupItem>
          <ToggleGroupItem value="false">No</ToggleGroupItem>
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
      // Requirement rows don't carry the attribute's option list, so we fall
      // back to free text here. Wire this to attributesApi.getById(requirement.attributeId)
      // once you want a real <Select> of valid options for candidates.
      return <Input value={value} onChange={(e) => onChange(e.target.value)} />;
    default:
      return <Input value={value} onChange={(e) => onChange(e.target.value)} />;
  }
}
