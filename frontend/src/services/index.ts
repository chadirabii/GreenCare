// ==========================================
// Services Index - Central Export Point
// ==========================================

// Core API client
export { default as api, initializeCSRF } from "./api";

// Type definitions
export type {
  Product,
  ProductCreateUpdate,
  User,
  LoginCredentials,
  RegisterData,
  Plant,
  ApiResponse,
  ApiError,
} from "./types";

// Product Service
export {
  getProducts,
  getProduct,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from "./productService";

// Authentication Service
export { login, register, logout, getCurrentUser } from "./authService";

// Plant Service
