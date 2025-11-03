// ==========================================
// Type Definitions for API Models
// ==========================================

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
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
  image: string;
}

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture?: string;
  role?: string;
}

// Plant Types
export interface Plant {
  id: string;
  name: string;
  scientific_name: string;
  description: string;
  care_level: string;
  water_frequency: string;
  sunlight: string;
  image: string;
  created_at: string;
  updated_at: string;
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
