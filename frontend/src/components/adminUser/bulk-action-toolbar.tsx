"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALL_ROLES, Roles } from "@/types/users";

export function BulkActionsToolbar({
    selectedCount,
    canEdit,
    isApplyingRole,
    isDeleting,
    onEdit,
    onApplyRole,
    onDelete,
    onClear,
}: {
    selectedCount: number;
    canEdit: boolean;
    isApplyingRole: boolean;
    isDeleting: boolean;
    onEdit: () => void;
    onApplyRole: (role: Roles) => void;
    onDelete: () => void;
    onClear: () => void;
}) {
    const t = useTranslations("adminUsers");
    const [pendingRole, setPendingRole] = useState<Roles>(Roles.Candidate);

    if (selectedCount === 0) return null;

    return (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm">
                <span className="font-medium">{t("toolbar.selected", { count: selectedCount })}</span>
                <button
                    type="button"
                    onClick={onClear}
                    className="text-muted-foreground underline-offset-2 hover:underline"
                >
                    {t("toolbar.clear")}
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {canEdit && (
                    <Button type="button" variant="outline" size="sm" onClick={onEdit}>
                        <Pencil className="h-4 w-4" />
                        {t("actions.edit")}
                    </Button>
                )}

                <div className="flex items-center gap-1.5">
                    <select
                        value={pendingRole}
                        onChange={(e) => setPendingRole(e.target.value as Roles)}
                        aria-label={t("toolbar.roleToApply")}
                        className="h-8 rounded-md border border-input bg-background text-foreground px-2 text-xs shadow-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                        {ALL_ROLES.map((role) => (
                            <option key={role} value={role} className="bg-background text-foreground">
                                {t(`roles.${role}`)}
                            </option>
                        ))}
                    </select>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onApplyRole(pendingRole)}
                        disabled={isApplyingRole}
                    >
                        {isApplyingRole ? <Loader2 className="h-4 w-4 animate-spin" /> : t("toolbar.applyRole")}
                    </Button>
                </div>

                <Button type="button" variant="destructive" size="sm" onClick={onDelete} disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    {t("actions.delete")}
                </Button>

                <button
                    type="button"
                    onClick={onClear}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:hidden"
                    aria-label={t("toolbar.clear")}
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}