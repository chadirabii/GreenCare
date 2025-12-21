import api from "./api";
import { Order, OrderCreateUpdate } from "./types";

// Re-export types for convenience
export type { Order, OrderCreateUpdate };

// ==========================================
// Order Service
// ==========================================

/**
 * Get all orders for the current user (buyer)
 */
export const getMyOrders = async (): Promise<Order[]> => {
  const response = await api.get("/products/orders/my_orders/");
  return response.data;
};

/**
 * Get all sales for the current user (seller)
 */
export const getMySales = async (): Promise<Order[]> => {
  const response = await api.get("/products/orders/my_sales/");
  return response.data;
};

/**
 * Get a single order by ID
 */
export const getOrder = async (id: string): Promise<Order> => {
  const response = await api.get(`/products/orders/${id}/`);
  return response.data;
};

/**
 * Create a new order
 */
export const createOrder = async (order: OrderCreateUpdate): Promise<Order> => {
  const response = await api.post("/products/orders/", order);
  return response.data;
};

/**
 * Update order status (seller only)
 */
export const updateOrderStatus = async (
  id: string,
  status: string
): Promise<Order> => {
  const response = await api.post(`/products/orders/${id}/update_status/`, {
    status,
  });
  return response.data;
};

/**
 * Cancel an order (buyer)
 */
export const cancelOrder = async (id: string): Promise<void> => {
  await api.delete(`/products/orders/${id}/`);
};

/**
 * Update order notes (seller)
 */
export const updateOrderNotes = async (
  id: string,
  notes: string
): Promise<Order> => {
  const response = await api.put(`/products/orders/${id}/`, { notes });
  return response.data;
};
