export type Role = "Candidate" | "Recruiter" | "Admin";

export interface UserProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  photoUrl: string;
  createdAt: string;
  updatedAt: string;
}


export interface UpdateProfileDto {
  firstName: string;
  lastName: string;
}


export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}