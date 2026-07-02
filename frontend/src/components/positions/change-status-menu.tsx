"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Loader2 } from "lucide-react";

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
  const [isChanging, setIsChanging] = useState(false);
  const nextOptions = POSITION_STATUS_TRANSITIONS[position.status];

  async function handleChange(status: (typeof nextOptions)[number]) {
    setIsChanging(true);
    try {
      const updated = await positionsApi.changeStatus(position.id, { status });
      toast.success(`Position marked as ${status.toLowerCase()}`);
      onChanged(updated);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't change the status"));
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
          Change status
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {nextOptions.map((status) => (
          <DropdownMenuItem key={status} onSelect={() => handleChange(status)}>
            Mark as {status}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
