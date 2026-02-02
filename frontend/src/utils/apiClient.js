import axios from "axios";
import toast from "react-hot-toast";
import { retry } from "./helpers";

/**
 * Enhanced API Client with retry logic and better error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.radeo.in";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `📤 ${config.method?.toUpperCase()} ${config.url}`,
        config.data,
      );
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `📥 ${response.config.method?.toUpperCase()} ${response.config.url}`,
        response.data,
      );
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error in development
    if (process.env.NODE_ENV === "development") {
      console.error(
        `❌ ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
        {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
        },
      );
    }

    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/api/v1/auth/refresh`,
            {
              refreshToken,
            },
          );

          const { accessToken } = response.data;
          localStorage.setItem("accessToken", accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        // Redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (!error.response) {
      toast.error("Network error. Please check your connection.");
      return Promise.reject(new Error("Network error"));
    }

    // Handle other errors with toast notifications
    const errorMessage =
      error.response?.data?.message || error.message || "Something went wrong";

    // Don't show toast for certain status codes handled elsewhere
    if (![401, 404].includes(error.response?.status)) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  },
);

/**
 * Enhanced API request function with retry logic
 */
const apiRequest = async (config, options = {}) => {
  const { retries = 0, showErrorToast = true } = options;

  try {
    if (retries > 0) {
      return await retry(() => apiClient(config), retries);
    }
    return await apiClient(config);
  } catch (error) {
    if (showErrorToast && error.response) {
      const message = error.response.data?.message || "Request failed";
      toast.error(message);
    }
    throw error;
  }
};

/**
 * API methods
 */
export const api = {
  // Generic methods
  get: (url, config = {}, options = {}) =>
    apiRequest({ method: "GET", url, ...config }, options),

  post: (url, data, config = {}, options = {}) =>
    apiRequest({ method: "POST", url, data, ...config }, options),

  put: (url, data, config = {}, options = {}) =>
    apiRequest({ method: "PUT", url, data, ...config }, options),

  patch: (url, data, config = {}, options = {}) =>
    apiRequest({ method: "PATCH", url, data, ...config }, options),

  delete: (url, config = {}, options = {}) =>
    apiRequest({ method: "DELETE", url, ...config }, options),

  // File upload
  upload: (url, formData, onUploadProgress) =>
    apiRequest({
      method: "POST",
      url,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    }),
};

export default api;
