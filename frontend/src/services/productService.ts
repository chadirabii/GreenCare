import api from "./api";
import { Product, ProductCreateUpdate } from "./types";

// Re-export types for convenience
export type { Product, ProductCreateUpdate };

// ==========================================
// Product Service
// ==========================================

/**
 * Get all products with optional category filter
 */
export const getProducts = async (category?: string): Promise<Product[]> => {
  const url =
    category && category !== "all"
      ? `/products/?category=${category}`
      : "/products/";

  const response = await api.get(url);
  return response.data;
};

/**
 * Get a single product by ID
 */
export const getProduct = async (id: string): Promise<Product> => {
  const response = await api.get(`/products/${id}/`);
  return response.data;
};

/**
 * Get user's products
 */
export const getMyProducts = async (): Promise<Product[]> => {
  const response = await api.get("/products/my_products/");
  return response.data;
};

/**
 * Create a new product
 */
export const createProduct = async (
  product: ProductCreateUpdate
): Promise<Product> => {
  const response = await api.post("/products/", product);
  return response.data;
};

/**
 * Update an existing product
 */
export const updateProduct = async (
  id: string,
  product: ProductCreateUpdate
): Promise<Product> => {
  const response = await api.put(`/products/${id}/`, product);
  return response.data;
};

/**
 * Delete a product
 */
export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}/`);
};

/**
 * Upload product image to Cloudinary
 */
export const uploadProductImage = async (imageFile: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await api.post("/products/upload_image/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.image_url;
};
