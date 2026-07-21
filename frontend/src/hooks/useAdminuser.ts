"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { extractErrorMessage } from "@/lib/api";
import { AdminUpdateUserDto, Roles, UpdateUserRoleDto, UserDto } from "@/types/users";
import { adminUsersApi } from "@/lib/api/adminUser";


const PAGE_SIZE = 10;

export type ToastState = { type: "success" | "error"; message: string } | null;

export function useAdminUsers() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Roles>("all");
  const [page, setPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await adminUsersApi.list();
      setUsers(data);
    } catch (err) {
      setLoadError(extractErrorMessage(err, "Failed to load users"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);


  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [search, roleFilter]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      if (!matchesRole) return false;
      if (!term) return true;
      const haystack = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const allSelected = ids.length > 0 && ids.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allSelected) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const updateRole = useCallback(
    async (id: string, dto: UpdateUserRoleDto, successMessage: string, errorMessage: string) => {
      const previous = users;
      setUsers((current) => current.map((u) => (u.id === id ? { ...u, role: dto.role } : u)));
      try {
        const updated = await adminUsersApi.updateRole(id, dto);
        setUsers((current) => current.map((u) => (u.id === id ? updated : u)));
        showToast("success", successMessage);
        return true;
      } catch (err) {
        setUsers(previous);
        showToast("error", extractErrorMessage(err, errorMessage));
        return false;
      }
    },
    [users, showToast]
  );

  const updateUser = useCallback(
    async (id: string, dto: AdminUpdateUserDto, successMessage: string, errorMessage: string) => {
      try {
        const updated = await adminUsersApi.update(id, dto);
        setUsers((current) => current.map((u) => (u.id === id ? updated : u)));
        showToast("success", successMessage);
        return true;
      } catch (err) {
        showToast("error", extractErrorMessage(err, errorMessage));
        return false;
      }
    },
    [showToast]
  );

  const bulkUpdateRole = useCallback(
    async (ids: string[], role: Roles, successMessage: string, errorMessage: string) => {
      const previous = users;
      setUsers((current) => current.map((u) => (ids.includes(u.id) ? { ...u, role } : u)));
      try {
        const updated = await adminUsersApi.updateRoles(ids, role);
        const updatedMap = new Map(updated.map((u) => [u.id, u]));
        setUsers((current) => current.map((u) => updatedMap.get(u.id) ?? u));
        showToast("success", successMessage);
        return true;
      } catch (err) {
        setUsers(previous);
        showToast("error", extractErrorMessage(err, errorMessage));
        return false;
      }
    },
    [users, showToast]
  );

  const bulkDelete = useCallback(
    async (ids: string[], successMessage: string, errorMessage: string) => {
      const previous = users;
      setUsers((current) => current.filter((u) => !ids.includes(u.id)));
      try {
        await adminUsersApi.removeMany(ids);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          ids.forEach((id) => next.delete(id));
          return next;
        });
        showToast("success", successMessage);
        return true;
      } catch (err) {
        setUsers(previous);
        showToast("error", extractErrorMessage(err, errorMessage));
        return false;
      }
    },
    [users, showToast]
  );

  return {
    users: paged,
    allUsers: users,
    totalCount: filtered.length,
    isLoading,
    loadError,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    page,
    setPage,
    totalPages,
    pageSize: PAGE_SIZE,
    toast,
    refetch: fetchUsers,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    updateRole,
    updateUser,
    bulkUpdateRole,
    bulkDelete,
  };
}