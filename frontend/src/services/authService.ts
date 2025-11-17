import api from "./api";
import { LoginCredentials, RegisterData, User, AuthResponse } from "./types";

// ==========================================
// Authentication Service
// ==========================================

/**
 * Login user with email and password
 */
export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await api.post("/auth/login/", credentials);
  return response.data;
};

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post("/auth/register/", data);
  return response.data;
};

/**
 * Logout current user
 */
export const logout = async (
  refreshToken: string
): Promise<{
  message: string;
}> => {
  const response = await api.post("/auth/logout/", {
    refresh_token: refreshToken,
  });
  return response.data;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get("/auth/me/");
  return response.data;
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<{
  access: string;
}> => {
  const response = await api.post("/auth/token/refresh/", {
    refresh: refreshToken,
  });
  return response.data;
};
