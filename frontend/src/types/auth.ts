export type UserRole = "Candidate" | "Recruiter" | "Administrator";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl?: string | null;
  role: UserRole;
}