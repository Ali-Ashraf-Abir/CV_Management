"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Search, ShieldAlert } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

import { cn } from "@/lib/utils";
import { ALL_ROLES, AdminUpdateUserDto, Roles } from "@/types/users";
import { useAdminUsers } from "@/hooks/useAdminuser";
import { BulkActionsToolbar } from "@/components/adminUser/bulk-action-toolbar";
import { UserTable } from "@/components/adminUser/user-table";
import { EditUserModal } from "@/components/adminUser/edit-user-modal";
import { BulkDeleteDialog } from "@/components/adminUser/bulk-delete-dioalogue";

export default function AdminUsersPage() {
  const t = useTranslations("adminUsers");
  const locale = useLocale();
  const router = useRouter();
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();

  const {
    users,
    allUsers,
    totalCount,
    isLoading,
    loadError,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    page,
    setPage,
    totalPages,
    pageSize,
    toast,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    updateUser,
    bulkUpdateRole,
    bulkDelete,
  } = useAdminUsers();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isApplyingRole, setIsApplyingRole] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedCount = selectedIds.size;
  const editTarget = useMemo(() => {
    if (selectedCount !== 1) return null;
    const [id] = selectedIds;
    return allUsers.find((u) => u.id === id) ?? null;
  }, [selectedCount, selectedIds, allUsers]);

  if (isAuthLoading) {
    return null;
  }

  if (!currentUser || currentUser.role !== Roles.Administrator) {
    router.push(`/${locale}/jobs`);
    return null;
  }

  const selectedIdsArray = Array.from(selectedIds);
  const isSelfIncluded = currentUser ? selectedIds.has(currentUser.id) : false;

  async function handleSaveUser(id: string, values: AdminUpdateUserDto) {
    return updateUser(id, values, t("toast.userUpdated"), t("toast.userUpdateFailed"));
  }

  async function handleApplyRole(role: Roles) {
    if (selectedIdsArray.length === 0) return;
    setIsApplyingRole(true);
    await bulkUpdateRole(selectedIdsArray, role, t("toast.roleUpdated"), t("toast.roleUpdateFailed"));
    setIsApplyingRole(false);
  }

  async function handleConfirmDelete() {
    if (selectedIdsArray.length === 0) return;
    setIsDeleting(true);
    const ok = await bulkDelete(selectedIdsArray, t("toast.usersDeleted"), t("toast.usersDeleteFailed"));
    setIsDeleting(false);
    if (ok) {
      setIsDeleteOpen(false);
      if (isSelfIncluded) {
        router.push(`/${locale}/jobs`);
      }
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-9"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as "all" | Roles)}
          className="h-9 rounded-md border border-input bg-background text-foreground px-3 text-sm shadow-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 sm:w-48"
        >
          <option value="all">{t("roleFilter.all")}</option>
          {ALL_ROLES.map((role) => (
            <option key={role} value={role}>
              {t(`roles.${role}`)}
            </option>
          ))}
        </select>
      </div>

      {loadError && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {loadError}
        </div>
      )}

      {isSelfIncluded && selectedCount > 0 && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {t("toolbar.selfIncludedWarning")}
        </div>
      )}

      <BulkActionsToolbar
        selectedCount={selectedCount}
        canEdit={selectedCount === 1}
        isApplyingRole={isApplyingRole}
        isDeleting={isDeleting}
        onEdit={() => setIsEditOpen(true)}
        onApplyRole={handleApplyRole}
        onDelete={() => setIsDeleteOpen(true)}
        onClear={clearSelection}
      />

      <UserTable
        users={users}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onToggleRow={toggleSelect}
        onToggleAll={toggleSelectAll}
      />

      {!isLoading && totalCount > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            {t("pagination.showing", {
              from: (page - 1) * pageSize + 1,
              to: Math.min(page * pageSize, totalCount),
              total: totalCount,
            })}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="rounded-md border border-border px-3 py-1.5 transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
            >
              {t("pagination.previous")}
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-md border border-border px-3 py-1.5 transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
            >
              {t("pagination.next")}
            </button>
          </div>
        </div>
      )}

      <EditUserModal
        user={editTarget}
        open={isEditOpen && editTarget !== null}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveUser}
      />

      <BulkDeleteDialog
        open={isDeleteOpen}
        count={selectedIdsArray.length}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      {toast && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 rounded-lg border px-4 py-3 text-sm shadow-lg animate-in fade-in slide-in-from-bottom-2",
            toast.type === "success"
              ? "border-border bg-card text-foreground"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          )}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}