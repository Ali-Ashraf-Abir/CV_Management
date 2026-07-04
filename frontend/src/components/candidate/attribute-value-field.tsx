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
import { useEffect, useState } from "react";
import { AttributeDto } from "@/types/attribute";
import { attributesApi } from "@/lib/api/attributes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";


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
  const [attributeDropdowns, setAttributeDropdowns] = useState<AttributeDto>()
  useEffect(() => {
    if (requirement.attributeType == 'Dropdown') {
      attributesApi.getById(requirement.attributeId).then(setAttributeDropdowns)
    }
  }, [requirement])
  console.log(attributeDropdowns)
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

      return attributeDropdowns && <Select value={value} onValueChange={onChange}>
        <FormControl>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose an attribute" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {requirement === null && (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading...</div>
          )}
          {requirement !== null && attributeDropdowns.values.length === 0 && (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              No more filterable attributes available.
            </div>
          )}
          {attributeDropdowns.values.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    default:
      return <Input value={value} onChange={(e) => onChange(e.target.value)} />;
  }
}
