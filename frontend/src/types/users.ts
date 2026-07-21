
export enum Roles {
  Candidate = "Candidate",
  Recruiter = "Recruiter",
  Administrator = "Administrator",
}

export const ALL_ROLES: Roles[] = [Roles.Candidate, Roles.Recruiter, Roles.Administrator];

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Roles;
  photoUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRoleDto {
  role: Roles;
}

export interface AdminUpdateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  role: Roles;
  photoUrl: string;
}