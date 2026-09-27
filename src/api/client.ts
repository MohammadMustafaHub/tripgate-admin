import axios, { type AxiosError } from "axios";
import createAuthRefresh from "axios-auth-refresh";
import type { Tokens } from "@/models/auth";
import type { SuccessResponse } from "./responses";
import { tokenStorage } from "./tokens-storage";

declare module "axios" {
  interface AxiosRequestConfig {
    // Read by axios-auth-refresh: a 401 on this request will not trigger a token refresh.
    skipAuthRefresh?: boolean;
  }
}

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error("VITE_API_URL is not defined");
}

const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let sessionExpiredHandler: (() => void) | undefined;

// Called when the refresh token is missing or rejected, so the app can sign the user out.
export function onSessionExpired(handler: () => void) {
  sessionExpiredHandler = handler;
}

const refreshAuthLogic = async (failedRequest: AxiosError) => {
  const refreshToken = tokenStorage.getRefreshToken();
  try {
    if (!refreshToken) {
      throw new Error("No refresh token");
    }
    const response = await axios.post<SuccessResponse<Tokens>>(
      `${API_URL}/auth/Tokens/refresh`,
      { refreshToken },
    );
    tokenStorage.set(response.data.data);
    if (failedRequest.response) {
      failedRequest.response.config.headers["Authorization"] =
        "Bearer " + response.data.data.accessToken;
    }
  } catch (error) {
    tokenStorage.clear();
    sessionExpiredHandler?.();
    throw error;
  }
};

// Instantiate the interceptor
createAuthRefresh(client, refreshAuthLogic);

client.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (!token) {
    return config;
  }
  config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

export default client;
