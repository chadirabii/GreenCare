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
  withCredentials: true, // Enable sending cookies with requests
});

// ==========================================
// Helper Functions
// ==========================================

/**
 * Get CSRF token from cookie
 */
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

// ==========================================
// Request Interceptor
// ==========================================

api.interceptors.request.use(
  (config) => {
    // Add CSRF token to all requests
    const csrfToken = getCookie("csrftoken");
    if (csrfToken) {
      config.headers["X-CSRFToken"] = csrfToken;
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

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors here
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          console.warn("Unauthorized - User needs to log in");
          break;
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

// ==========================================
// CSRF Initialization
// ==========================================

/**
 * Initialize CSRF token by making a request to the CSRF endpoint
 */
export const initializeCSRF = async (): Promise<void> => {
  try {
    await api.get("/auth/csrf/");
  } catch (error) {
    console.warn(
      "CSRF token initialization failed (this is OK for mock auth):",
      error
    );
  }
};

export default api;
