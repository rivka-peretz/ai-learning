// ===========================================
// User Management Types
// ===========================================

export interface User {
  id: number;
  name: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserWithRole extends User {
  role: 'admin' | 'student';
}

export interface LoginCredentials {
  name: string;
  phone: string;
}

// ===========================================
// Category & Classification Types
// ===========================================

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}

export interface SubCategory {
  id: number;
  name: string;
  category_id: number;
  description?: string;
  created_at?: string;
}

// ===========================================
// Prompt & AI Interaction Types
// ===========================================

export interface PromptItem {
  id: number;
  user_id: number;
  category_id: number | null;
  sub_category_id: number | null;
  prompt: string;
  response: string | null;
  created_at: string;
  updated_at?: string;
}

export interface PromptView extends PromptItem {
  user_name?: string;
  category_name?: string | null;
  sub_category_name?: string | null;
}

export interface PromptWithDetails extends PromptItem {
  user_name: string;
  user_phone: string;
  category_name: string | null;
  sub_category_name: string | null;
}

export interface CreatePromptRequest {
  user_id: number;
  category_id: number;
  sub_category_id: number;
  prompt: string;
}

// ===========================================
// API Response Types
// ===========================================

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface FetchPromptsResponse extends PaginatedResponse<PromptView> {}

// ===========================================
// Form & UI State Types
// ===========================================

export interface FormErrors {
  [key: string]: string;
}

export interface LoginFormState {
  name: string;
  phone: string;
  errors: {
    name: string;
    phone: string;
  };
  serverError: string;
}

export interface PromptFormState {
  category: string;
  subCategory: string;
  prompt: string;
  response: string;
  loading: boolean;
  error: string;
}

// ===========================================
// History & Dashboard Types
// ===========================================

export interface HistoryItem {
  id?: number;
  category: string;
  subCategory: string;
  prompt: string;
  response: string;
  date?: string;
}

export interface AdminDashboardData {
  id: number;
  name: string;
  phone: string;
  category: string;
  subCategory: string;
  prompt: string;
  response: string;
  date: string;
}

// ===========================================
// Context Types
// ===========================================

export interface UserContextType {
  user: UserWithRole | null;
  login: (user: UserWithRole) => void;
  logout: () => void;
  addToHistory: (item: HistoryItem) => void;
  history: HistoryItem[];
}
