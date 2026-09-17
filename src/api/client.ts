import axios from "axios";
import createAuthRefresh from "axios-auth-refresh";


const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5134';
if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshAuthLogic = (failedRequest: any) =>
  axios.post(`${API_URL}/api/auth/tokens/refresh`, {
    refreshToken: localStorage.getItem('refreshToken')
  }).then((tokenRefreshResponse) => {
    localStorage.setItem('refreshToken', tokenRefreshResponse.data.data.refreshToken);
    localStorage.setItem('accessToken', tokenRefreshResponse.data.data.accessToken);
    failedRequest.response.config.headers['Authorization'] = 'Bearer ' + tokenRefreshResponse.data.data.accessToken;
    return Promise.resolve();
  });

// Instantiate the interceptor
createAuthRefresh(client, refreshAuthLogic);

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return config;
  }
  config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});



/* ------------------------------------------------------------------------- */
/* Helpers the endpoint modules import. The client above is left untouched.   */
/* ------------------------------------------------------------------------- */

export { client };

// The keys the interceptor and the refresh logic above already read.
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(tokens: {
  accessToken: string;
  refreshToken: string;
}): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/** The status an endpoint should branch on, or null when the request never landed. */
export function httpStatus(error: unknown): number | null {
  return axios.isAxiosError(error) ? (error.response?.status ?? null) : null;
}
