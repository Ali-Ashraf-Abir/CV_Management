export type ApplicationStatus = "Pending" | "Accepted" | "Rejected"; // match backend ApplicationStatus enum names exactly

export type ApplyToPositionDto = {
  positionId: string;
};

export type ApplicationDto = {
  id: string;
  positionId: string;
  positionTitle: string;
  appliedAt: string;
  status: ApplicationStatus;
};

export type ApplicantDto = {
  applicationId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl: string | null;
  appliedAt: string;
  status: ApplicationStatus;
};

export type UpdateApplicationStatusDto = {
  status: ApplicationStatus;
};