import api from "./api";
import { LoginCredentials, RegisterData, User } from "./types";

// ==========================================
// Authentication Service
// ==========================================

/**
 * Login user with username and password
 */
export const login = async (
  credentials: LoginCredentials
): Promise<{
  message: string;
  username: string;
}> => {
  const response = await api.post("/auth/login/", credentials);
  return response.data;
};

/**
 * Register a new user
 */
export const register = async (
  data: RegisterData
): Promise<{
  message: string;
}> => {
  const response = await api.post("/auth/register/", data);
  return response.data;
};

/**
 * Logout current user
 */
export const logout = async (): Promise<{
  message: string;
}> => {
  const response = await api.post("/auth/logout/");
  return response.data;
};

/**
 * Get current user profile (if available)
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // This endpoint would need to be implemented in your backend
    const response = await api.get("/auth/me/");
    return response.data;
  } catch (error) {
    return null;
  }
};
