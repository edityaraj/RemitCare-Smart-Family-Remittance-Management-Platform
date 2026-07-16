import { api } from "./api";
import type { PublicUser, Role } from "@/types";

export async function register(input: { name: string; email: string; password: string; role: Role }) {
  const { data } = await api.post<{ user: PublicUser; accessToken: string; refreshToken: string }>(
    "/auth/register",
    input
  );
  persistSession(data.accessToken, data.refreshToken);
  return data.user;
}

export async function login(input: { email: string; password: string }) {
  const { data } = await api.post<{ user: PublicUser; accessToken: string; refreshToken: string }>(
    "/auth/login",
    input
  );
  persistSession(data.accessToken, data.refreshToken);
  return data.user;
}

export async function me() {
  const { data } = await api.get<{ user: PublicUser }>("/auth/me");
  return data.user;
}

export async function logout() {
  await api.post("/auth/logout").catch(() => undefined);
  localStorage.removeItem("remitcare_access_token");
  localStorage.removeItem("remitcare_refresh_token");
}

function persistSession(accessToken: string, refreshToken: string) {
  localStorage.setItem("remitcare_access_token", accessToken);
  localStorage.setItem("remitcare_refresh_token", refreshToken);
}
