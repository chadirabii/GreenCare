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
  Order,
  OrderCreateUpdate,
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

// Order Service
export {
  getMyOrders,
  getMySales,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  updateOrderNotes,
} from "./orderService";

// Authentication Service
export { login, register, logout, getCurrentUser } from "./authService";

// Plant Service
