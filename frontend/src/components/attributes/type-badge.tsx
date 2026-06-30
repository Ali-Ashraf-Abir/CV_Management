import {
  Type,
  AlignLeft,
  Image as ImageIcon,
  Hash,
  Calendar,
  CalendarRange,
  ToggleLeft,
  ListChecks,
  LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { AttributeType } from "@/types/attribute";

const TYPE_META: Record<AttributeType, { icon: LucideIcon; className: string }> = {
  String: {
    icon: Type,
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900",
  },
  Text: {
    icon: AlignLeft,
    className: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-900",
  },
  Image: {
    icon: ImageIcon,
    className: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-900",
  },
  Numeric: {
    icon: Hash,
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
  },
  Date: {
    icon: Calendar,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
  },
  Period: {
    icon: CalendarRange,
    className: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-900",
  },
  Boolean: {
    icon: ToggleLeft,
    className: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  Dropdown: {
    icon: ListChecks,
    className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-900",
  },
};

// Icon + color only — no copy, so this stays safe to call from server components too.
export function getAttributeTypeMeta(type: AttributeType) {
  return TYPE_META[type];
}

export function AttributeTypeBadge({
  type,
  className,
}: {
  type: AttributeType;
  className?: string;
}) {
  const t = useTranslations("attributes.types");
  const meta = TYPE_META[type];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        meta.className,
        className
      )}
    >
      <Icon className="size-3.5" />
      {t(`${type}.label`)}
    </span>
  );
}
