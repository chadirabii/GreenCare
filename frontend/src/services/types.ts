// ==========================================
// Type Definitions for API Models
// ==========================================

// Product Image Types
export interface ProductImage {
  id: string;
  image_url: string;
  public_id?: string;
  order: number;
  created_at: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  images: ProductImage[];
  owner: string;
  owner_name: string;
  owner_email: string;
  created_at: string;
  updated_at: string;
}

export interface ProductCreateUpdate {
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  image_urls?: string[];
}

// User Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "farmer" | "plant_owner" | "seller";
  profile_picture?: string;
  created_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  profile_picture?: string;
  role?: "admin" | "farmer" | "plant_owner" | "seller";
}

export interface AuthResponse {
  message: string;
  access: string;
  refresh: string;
  user: User;
}

// Plant Types
export interface Plant {
  id: number;
  name: string;
  species: string;
  age: number;
  height: number;
  width: number;
  description: string;
  image?: string;
}

export interface PlantCreateUpdate {
  name: string;
  species: string;
  age: number;
  height: number;
  width: number;
  description: string;
  image?: File | string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}
