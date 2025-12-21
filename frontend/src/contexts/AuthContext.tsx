import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "@/services/authService";
import { setTokens, clearTokens, getAccessToken } from "@/services/api";
import { User, LoginCredentials, RegisterData } from "@/services/types";

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: () => {},
  isAuthenticated: false,
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const token = getAccessToken();

      if (token) {
        try {
          // Fetch current user from backend using token
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          // Token is invalid, clear everything
          clearTokens();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);

      setTokens(response.access, response.refresh);

      setUser(response.user);

      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.response?.data?.error || "Login failed");
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);

      setTokens(response.access, response.refresh);

      setUser(response.user);

      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(error.response?.data?.error || "Registration failed");
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all auth data
      setUser(null);
      clearTokens();
      navigate("/auth");
    }
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};
