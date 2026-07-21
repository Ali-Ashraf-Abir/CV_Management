
import { AdminUpdateUserDto, Roles, UpdateUserRoleDto, UserDto } from "@/types/users";
import { api } from "../api";

export const adminUsersApi = {
  list: async (): Promise<UserDto[]> => {
    const { data } = await api.get<UserDto[]>("/admin/users");
    return data;
  },
  getById: async (id: string): Promise<UserDto> => {
    const { data } = await api.get<UserDto>(`/admin/users/${id}`);
    return data;
  },
  updateRole: async (id: string, dto: UpdateUserRoleDto): Promise<UserDto> => {
    const { data } = await api.patch<UserDto>(`/admin/users/${id}/role`, dto);
    return data;
  },
  update: async (id: string, dto: AdminUpdateUserDto): Promise<UserDto> => {
    const { data } = await api.put<UserDto>(`/admin/users/${id}`, dto);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },

  // Bulk operations, used by the selection toolbar.
  updateRoles: async (ids: string[], role: Roles): Promise<UserDto[]> => {
    const { data } = await api.patch<UserDto[]>("/admin/users/role", { ids, role });
    return data;
  },
  removeMany: async (ids: string[]): Promise<void> => {
    await api.delete("/admin/users", { data: ids });
  },
};