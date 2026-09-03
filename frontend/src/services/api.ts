import type { AccountInfo } from "@azure/msal-browser";
import type { ApiError, AskRequest, AskResponse, UserContext } from "../types/api";
import { getApiAccessToken } from "./auth";

async function apiRequest<T>(path: string, account?: AccountInfo, init?: RequestInit): Promise<T> {
  const accessToken = await getApiAccessToken(account);
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiError | null;
    throw new Error(error?.message ?? `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getUserContext(account?: AccountInfo) {
  return apiRequest<UserContext>("/api/context", account);
}

export function askQuestion(request: AskRequest, account?: AccountInfo) {
  return apiRequest<AskResponse>("/api/ask", account, {
    method: "POST",
    body: JSON.stringify(request),
  });
}
