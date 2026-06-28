import { api } from "./api";

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "Candidate" | "Recruiter";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
}

export interface RegisterResponse {
  firstName: string;
  lastName: string;
  email: string;
}

export async function registerUser(data: RegisterPayload): Promise<RegisterResponse> {
  const res = await api.post<RegisterResponse>("/auth/register", data);
  return res.data;
}

export async function loginUser(data: LoginPayload): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/login", data);
  return res.data;
}
