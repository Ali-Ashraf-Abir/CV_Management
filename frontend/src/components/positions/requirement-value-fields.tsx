"use client";

import { Control } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AttributeDto, AttributeSummaryDto } from "@/types/attribute";
import { RequirementFormValues } from "@/validations/requirement.schema";


interface RequirementValueFieldsProps {
  control: Control<RequirementFormValues>;
  attributeDetails: AttributeDto | null;
  attribute: AttributeSummaryDto;
  operator: string;
}

function ValueControl({
  attribute,
  value,
  onChange,
  placeholder,
  attributeDetails
}: {
  attribute: AttributeSummaryDto;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  attributeDetails: AttributeDto | null;
}) {
  switch (attribute.type) {
    case "Numeric":
      return (
        <Input
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
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
          <ToggleGroupItem value="true">True</ToggleGroupItem>
          <ToggleGroupItem value="false">False</ToggleGroupItem>
        </ToggleGroup>
      );
    case "Dropdown":
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose an option" />
          </SelectTrigger>
          <SelectContent>
            {attributeDetails?.values?.map((v) => (
              <SelectItem key={v.id} value={v.value}>
                {v.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    default:
      return (
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      );
  }
}

export function RequirementValueFields({ control, attribute, operator, attributeDetails }: RequirementValueFieldsProps) {
  const isBetween = operator === "Between";
  const isMultiDropdown = operator === "In" && attribute.type === "Dropdown";
  console.log(attributeDetails)
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="value"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{isBetween ? "From" : "Value"}</FormLabel>
            <FormControl>
              {isMultiDropdown ? (
                <DropdownMultiSelect
                  attribute={attribute}
                  value={field.value}
                  onChange={field.onChange}
                />
              ) : operator === "In" ? (
                <Input
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Comma-separated, e.g. React, Vue, Angular"
                />
              ) : (
                <ValueControl
                  attribute={attribute}
                  attributeDetails={attributeDetails}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Enter a value"
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {isBetween && (
        <FormField
          control={control}
          name="secondValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>To</FormLabel>
              <FormControl>
                <ValueControl
                  attributeDetails={attributeDetails}
                  attribute={attribute}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="Enter a value"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}

function DropdownMultiSelect({
  attribute,
  value,
  onChange,
}: {
  attribute: AttributeSummaryDto;
  value: string;
  onChange: (v: string) => void;
}) {
  const selected = new Set(
    value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
  );

  function toggle(option: string) {
    const next = new Set(selected);
    if (next.has(option)) next.delete(option);
    else next.add(option);
    onChange(Array.from(next).join(", "));
  }

  return (
    <div className="flex flex-wrap gap-2">
      {attribute.values.map((v) => (
        <button
          key={v.id}
          type="button"
          onClick={() => toggle(v.value)}
          className={
            "rounded-full border px-3 py-1 text-sm transition-colors " +
            (selected.has(v.value)
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-foreground hover:bg-muted")
          }
        >
          {v.value}
        </button>
      ))}
    </div>
  );
}
