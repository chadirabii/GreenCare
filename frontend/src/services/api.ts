import axios, { AxiosInstance, AxiosError } from "axios";

// ==========================================
// API Client Setup
// ==========================================

const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:8000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================================
// Token Management
// ==========================================

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem("access_token");
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem("refresh_token");
};

/**
 * Set authentication tokens
 */
export const setTokens = (access: string, refresh: string): void => {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
};

/**
 * Clear authentication tokens
 */
export const clearTokens = (): void => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

// ==========================================
// Request Interceptor
// ==========================================

api.interceptors.request.use(
  (config) => {
    // Add JWT token to all requests
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// Response Interceptor
// ==========================================

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        window.location.href = "/auth";
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          "http://localhost:8000/api/auth/token/refresh/",
          { refresh: refreshToken }
        );

        const { access } = response.data;
        setTokens(access, refreshToken);
        processQueue(null, access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        clearTokens();
        window.location.href = "/auth";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 403:
          console.warn("Forbidden - Access denied");
          break;
        case 404:
          console.warn("Resource not found");
          break;
        case 500:
          console.error("Server error");
          break;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
