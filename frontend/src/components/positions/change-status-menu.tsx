"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { extractErrorMessage } from "@/lib/api";
import { PositionDto, POSITION_STATUS_TRANSITIONS } from "@/types/position";
import { positionsApi } from "@/lib/api/position";

export function ChangeStatusMenu({
  position,
  onChanged,
}: {
  position: PositionDto;
  onChanged: (position: PositionDto) => void;
}) {
  const t = useTranslations("positions");
  const [isChanging, setIsChanging] = useState(false);
  const nextOptions = POSITION_STATUS_TRANSITIONS[position.status];

  async function handleChange(status: (typeof nextOptions)[number]) {
    setIsChanging(true);
    try {
      const updated = await positionsApi.changeStatus(position.id, { status });
      toast.success(t("statusChangeSuccess", { status: t(`status.${status}`) }));
      onChanged(updated);
    } catch (err) {
      toast.error(extractErrorMessage(err, t("statusChangeError")));
    } finally {
      setIsChanging(false);
    }
  }

  if (nextOptions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isChanging}>
          {isChanging && <Loader2 className="size-4 animate-spin" />}
          {t("changeStatus")}
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {nextOptions.map((status) => (
          <DropdownMenuItem key={status} onSelect={() => handleChange(status)}>
            {t("markAsStatus", { status: t(`status.${status}`) })}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}