import { api } from "./api";
import { setAccessToken } from "./token";
import type { User } from "@/types/auth";

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

export async function registerUser(data: RegisterPayload) {
  const res = await api.post<RegisterResponse>("/auth/register", data);
  return res.data;
}

export async function loginUser(data: LoginPayload) {
  const res = await api.post<LoginResponse>("/auth/login", data);

  setAccessToken(res.data.accessToken);

  return res.data;
}

export async function logoutUser() {
  await api.post("/auth/logout");
}

export async function getCurrentUser() {
  const res = await api.get<User>("/user/me");

  return res.data;
}

export async function refreshAccessToken() {
  const res = await api.post<LoginResponse>("/auth/refresh");

  setAccessToken(res.data.accessToken);

  return res.data.accessToken;
}