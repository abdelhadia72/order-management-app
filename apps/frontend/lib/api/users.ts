import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";
import { logObject } from "@/utils/debug-console";

export type User = {
  id?: string;
  _id?: string;
  userId?: string;
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  active?: boolean;
  status?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
};

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
  address?: string;
};

/**
 * Fetch all users
 */
export async function fetchUsers(): Promise<User[]> {
  console.log("Fetching users...");
  try {
    const response = await apiGet<any>("/users");

    // Debug what we received from the API
    console.log("Users API response type:", typeof response);
    logObject("Raw users API response", response);

    // Handle various response formats
    let users: User[] = [];

    if (Array.isArray(response)) {
      console.log(`Received an array of ${response.length} users`);
      users = response;
    } else if (response && typeof response === "object") {
      // Some APIs wrap the data in a data property
      if (Array.isArray(response.data)) {
        console.log(
          `Received ${response.data.length} users in a data property`
        );
        users = response.data;
      } else if (response.users && Array.isArray(response.users)) {
        console.log(
          `Received ${response.users.length} users in a users property`
        );
        users = response.users;
      } else {
        // If it's a single user object, wrap it in an array
        if (response.id || response._id || response.userId) {
          console.log("Received a single user object, converting to array");
          users = [response];
        } else {
          console.warn("Unexpected response format from users API:", response);
          users = [];
        }
      }
    } else {
      console.warn("Invalid response format from users API:", response);
      users = [];
    }

    // Debug the final processed users
    console.log(`Processed ${users.length} users`);
    if (users.length > 0) {
      logObject("First user", users[0]);
    }

    return users.map((user) => normalizeUser(user));
  } catch (error) {
    console.error("Error fetching users:", error);
    // Return empty array on error to avoid breaking the UI
    return [];
  }
}

/**
 * Fetch a single user by ID
 */
export async function fetchUser(id: string): Promise<User> {
  try {
    const user = await apiGet<User>(`/users/${id}`);
    return normalizeUser(user);
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserInput): Promise<User> {
  return apiPost<User>("/users", data);
}

/**
 * Update a user
 */
export async function updateUser(
  id: string,
  data: Partial<User>
): Promise<User> {
  return apiPatch<User>(`/users/${id}`, data);
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<void> {
  return apiDelete<void>(`/users/${id}`);
}

/**
 * Normalize user data to ensure consistent structure
 */
function normalizeUser(user: any): User {
  if (!user) return {};

  return {
    id: user.id || user._id || user.userId || undefined,
    name: user.name || user.fullName || user.userName || "",
    email: user.email || "",
    role: user.role || user.userRole || "User",
    avatar: user.avatar || user.profilePicture || user.image || undefined,
    phone: user.phone || user.phoneNumber || undefined,
    address: user.address || undefined,
    active:
      typeof user.active === "boolean"
        ? user.active
        : user.status === "active" || user.status === "ACTIVE",
    status: user.status || undefined,
    notes: user.notes || user.bio || undefined,
    createdAt: user.createdAt || user.created_at || undefined,
    updatedAt: user.updatedAt || user.updated_at || undefined,
  };
}
