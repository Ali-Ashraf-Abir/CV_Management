
import { ChangePasswordDto, UpdateProfileDto, UserProfileDto } from "@/types/profile";
import { api } from "../api";

export const profileApi = {
  getMine: async (): Promise<UserProfileDto> => {
    const { data } = await api.get<UserProfileDto>("/profile");
    return data;
  },

  update: async (dto: UpdateProfileDto): Promise<UserProfileDto> => {
    const { data } = await api.put<UserProfileDto>("/profile", dto);
    return data;
  },

  uploadPhoto: async (file: File): Promise<UserProfileDto> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<UserProfileDto>("/profile/photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  deletePhoto: async (): Promise<void> => {
    await api.delete("/profile/photo");
  },

  changePassword: async (dto: ChangePasswordDto): Promise<void> => {
    await api.put("/profile/change-password", dto);
  },
};