const MANAGER_ROLES = new Set(["Recruiter", "Administrator", "Admin"]);

export function isRecruiterOrAdmin(role?: string | null): boolean {
  return Boolean(role && MANAGER_ROLES.has(role));
}