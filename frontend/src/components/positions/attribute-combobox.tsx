"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AttributeSummaryDto } from "@/types/attribute";
import { CATEGORY_LABEL } from "@/lib/constants/attribute-category";

export function AttributeCombobox({
  attributes,
  value,
  onChange,
  isLoading,
  placeholder,
  emptyText,
}: {
  attributes: AttributeSummaryDto[];
  value: string;
  onChange: (id: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  emptyText?: string;
}) {
  const t = useTranslations("positions");
  const [open, setOpen] = useState(false);
  const selected = attributes.find((a) => a.id === value) ?? null;
  const resolvedPlaceholder = placeholder ?? t("choosePlaceholder");
  const resolvedEmptyText = emptyText ?? t("noMoreAttributes");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={isLoading}
          className="w-full justify-between font-normal"
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {isLoading ? t("loading") : selected ? selected.title : resolvedPlaceholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={t("searchAttributesPlaceholder")} />
          <CommandList>
            <CommandEmpty>{resolvedEmptyText}</CommandEmpty>
            <CommandGroup>
              {attributes.map((a) => (
                <CommandItem
                  key={a.id}
                  value={`${a.title} ${a.category}`}
                  onSelect={() => {
                    onChange(a.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "size-4",
                      value === a.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{a.title}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {CATEGORY_LABEL[a.category]}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}