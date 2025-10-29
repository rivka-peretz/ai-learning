import type { User, Category, SubCategory, PromptItem, PromptView } from "../types/types";

// Configuration
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Generic API request helper with error handling
 * Centralizes error handling and response parsing
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API error (${res.status}): ${errorText}`);
    }

    return await res.json();
  } catch (err) {
    console.error("❌ API Request failed:", err);
    throw err;
  }
}

// ===========================================
// Users API
// ===========================================

/**
 * Fetch all users from the system
 */
export async function fetchUsers(): Promise<User[]> {
  return apiRequest<User[]>("/api/users");
}

/**
 * Create a new user in the system
 */
export async function createUser(userData: { name: string; phone: string }): Promise<User> {
  return apiRequest<User>("/api/users", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

/**
 * Login user with name and phone
 */
export async function loginUser(name: string, phone: string) {
  const res = await fetch(`${API_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API error (${res.status}): ${error}`);
  }

  return res.json();
}

// ===========================================
// Prompts API
// ===========================================

/**
 * Fetch all prompts (basic view)
 */
export async function fetchAllPrompts(): Promise<PromptView[]> {
  return apiRequest<PromptView[]>("/api/prompts");
}

/**
 * Fetch all prompts with detailed user and category information
 * Used by admin dashboard for comprehensive system overview
 */
export async function fetchAllPromptsWithDetails(): Promise<any[]> {
  return apiRequest<any[]>("/api/prompts/all-with-details");
}

/**
 * Fetch prompts by specific user ID
 */
export async function fetchPromptsByUser(userId: number): Promise<PromptView[]> {
  return apiRequest<PromptView[]>(`/api/prompts/user/${userId}`);
}

/**
 * Add a new prompt to the system
 */
export async function addPrompt(promptData: {
  user_id: number;
  category_id: number;
  sub_category_id: number;
  prompt: string;
}): Promise<PromptItem> {
  return apiRequest<PromptItem>("/api/prompts", {
    method: "POST",
    body: JSON.stringify(promptData),
  });
}

// ===========================================
// Categories API
// ===========================================

/**
 * Fetch all available categories
 */
export async function fetchCategories(): Promise<Category[]> {
  return apiRequest<Category[]>("/api/categories");
}

/**
 * Fetch subcategories for a specific category
 */
export async function fetchSubCategories(categoryId: number): Promise<SubCategory[]> {
  return apiRequest<SubCategory[]>(`/api/categories/${categoryId}/sub-categories`);
}
