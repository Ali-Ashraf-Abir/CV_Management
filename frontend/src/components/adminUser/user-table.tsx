"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { UserDto } from "@/types/users";
import { RoleBadge } from "./role-badge";


function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function UserTable({
  users,
  isLoading,
  selectedIds,
  onToggleRow,
  onToggleAll,
}: {
  users: UserDto[];
  isLoading: boolean;
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
}) {
  const t = useTranslations("adminUsers");
  const pageIds = users.map((u) => u.id);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const someOnPageSelected = pageIds.some((id) => selectedIds.has(id));

  if (isLoading) {
    return (
      <div className="divide-y divide-border rounded-xl border border-border bg-card">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="h-4 w-4 animate-pulse rounded bg-muted" />
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <p className="text-sm font-medium">{t("empty.title")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("empty.description")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="w-10 px-5 py-3">
              <input
                type="checkbox"
                checked={allOnPageSelected}
                ref={(el) => {
                  if (el) el.indeterminate = !allOnPageSelected && someOnPageSelected;
                }}
                onChange={() => onToggleAll(pageIds)}
                aria-label={t("table.selectAll")}
                className="h-4 w-4 rounded border-input accent-foreground"
              />
            </th>
            <th className="px-5 py-3 font-medium">{t("table.user")}</th>
            <th className="px-5 py-3 font-medium">{t("table.role")}</th>
            <th className="px-5 py-3 font-medium">{t("table.joined")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user) => {
            const checked = selectedIds.has(user.id);
            return (
              <tr
                key={user.id}
                onClick={() => onToggleRow(user.id)}
                className={cn(
                  "cursor-pointer select-none transition-colors hover:bg-accent/40",
                  checked && "bg-accent/40"
                )}
              >
                <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleRow(user.id)}
                    aria-label={t("table.selectRow", { name: `${user.firstName} ${user.lastName}` })}
                    className="h-4 w-4 rounded border-input accent-foreground"
                  />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {user.photoUrl ? (
                      <img src={user.photoUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                        {initials(user.firstName, user.lastName)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <RoleBadge role={user.role} label={t(`roles.${user.role}`)} />
                </td>
                <td className="px-5 py-4 text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}