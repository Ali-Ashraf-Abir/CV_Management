"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";
import { AttributeDto } from "@/types/attribute";

export type DynamicAttributeValue =
  | string
  | number
  | boolean
  | { from: string; to: string }
  | null;

interface DynamicAttributeFieldProps {
  attribute: AttributeDto;
  value: DynamicAttributeValue;
  onChange: (value: DynamicAttributeValue) => void;
  disabled?: boolean;
}

export function DynamicAttributeField({
  attribute,
  value,
  onChange,
  disabled,
}: DynamicAttributeFieldProps) {
  const t = useTranslations("attributes.common");
  const id = `attr-${attribute.id}`;

  switch (attribute.type) {
    case "String":
      return (
        <Input
          id={id}
          disabled={disabled}
          placeholder={attribute.description || `Enter ${attribute.title.toLowerCase()}`}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "Text":
      return (
        <Textarea
          id={id}
          disabled={disabled}
          rows={4}
          placeholder={attribute.description || `Describe ${attribute.title.toLowerCase()}`}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "Numeric":
      return (
        <Input
          id={id}
          type="number"
          disabled={disabled}
          placeholder={attribute.description ?? "0"}
          value={(value as number) ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      );

    case "Date":
      return (
        <Input
          id={id}
          type="date"
          disabled={disabled}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "Period": {
      const period = (value as { from: string; to: string }) ?? { from: "", to: "" };
      return (
        <div className="flex items-center gap-2">
          <Input
            id={`${id}-from`}
            type="date"
            disabled={disabled}
            value={period.from}
            onChange={(e) => onChange({ ...period, from: e.target.value })}
          />
          <span className="text-sm text-muted-foreground shrink-0">{t("to")}</span>
          <Input
            id={`${id}-to`}
            type="date"
            disabled={disabled}
            value={period.to}
            onChange={(e) => onChange({ ...period, to: e.target.value })}
          />
        </div>
      );
    }

    case "Boolean":
      return (
        <div className="flex items-center gap-2">
          <Switch
            id={id}
            disabled={disabled}
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(checked)}
          />
          <Label htmlFor={id} className="font-normal text-sm text-muted-foreground">
            {value ? "Yes" : "No"}
          </Label>
        </div>
      );

    case "Dropdown":
      return (
        <Select
          disabled={disabled}
          value={(value as string) ?? undefined}
          onValueChange={(v) => onChange(v)}
        >
          <SelectTrigger id={id}>
            <SelectValue placeholder={t("selectPlaceholder", { title: attribute.title })} />
          </SelectTrigger>
          <SelectContent>
            {attribute.values
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((v) => (
                <SelectItem key={v.id} value={v.value}>
                  {v.value}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      );

    case "Image":
      return <ImageFieldPreview disabled={disabled} />;

    default:
      return null;
  }
}

function ImageFieldPreview({ disabled }: { disabled?: boolean }) {
  const t = useTranslations("attributes.common");
  const [fileName, setFileName] = useState<string | null>(null);
  return (
    <label
      className={`flex items-center gap-3 rounded-md border border-dashed px-3 py-2.5 text-sm text-muted-foreground transition-colors ${
        disabled ? "opacity-60" : "cursor-pointer hover:border-foreground/30 hover:text-foreground"
      }`}
    >
      <Upload className="size-4 shrink-0" />
      <span className="truncate">{fileName ?? t("uploadImage")}</span>
      <input
        type="file"
        accept="image/*"
        disabled={disabled}
        className="hidden"
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
      />
    </label>
  );
}
