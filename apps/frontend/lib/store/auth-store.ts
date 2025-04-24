import { create } from "zustand"
import { persist } from "zustand/middleware"
import { API_URL } from "@/lib/api/config"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export type User = {
  id: string
  name: string
  email: string
  role: "user" | "admin"
}

type AuthState = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

// API functions
const loginApi = async (email: string, password: string) => {
  if (!API_URL) {
    throw new Error("API URL is not defined");
  }

  const response = await fetch(`http://localhost:8000/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    let errorMessage = "Login failed";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // If parsing fails, use default error message
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log("Login response data:", data);

  // Transform the data to match the expected format
  return {
    user: {
      id: data.user.userId.toString(),
      name: data.user.name,
      email: data.user.email,
      role: data.user.role
    },
    token: data.access_token
  };
};

const registerApi = async (name: string, email: string, password: string) => {
  if (!API_URL) {
    throw new Error("API URL is not defined");
  }

  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    let errorMessage = "Registration failed";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
    }
    throw new Error(errorMessage);
  }

  return await response.json();
};

const fetchUserProfile = async (token: string) => {
  if (!API_URL) {
    throw new Error("API URL is not defined");
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return await response.json();
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          const data = await loginApi(email, password);

          if (typeof window !== 'undefined') {
            localStorage.setItem("token", data.token);
          }

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true
          });
        } catch (error) {
          console.error("Login error:", error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true });

        try {
          await registerApi(name, email, password);
          // Registration successful, but we don't auto-login
        } catch (error) {
          console.error("Registration error:", error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem("token");
        }
        set({ user: null, token: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        // Skip auth check if we're already loading or if we're not in a browser
        if (get().isLoading || typeof window === 'undefined') {
          return Promise.resolve();
        }

        // If already authenticated, don't check again to prevent loops
        if (get().isAuthenticated) {
          return Promise.resolve();
        }

        set({ isLoading: true });

        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

          if (!token) {
            set({ isLoading: false });
            return;
          }

          const userData = await fetchUserProfile(token);
          set({
            user: userData,
            token,
            isAuthenticated: true
          });
        } catch (error) {
          console.error("Auth check error:", error);
          if (typeof window !== 'undefined') {
            localStorage.removeItem("token");
          }
          set({ user: null, token: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
    },
  ),
);

// React Query hooks for authentication
export const useLogin = () => {
  const { login } = useAuthStore();
  return useMutation({
    mutationFn: ({ email, password }: { email: string, password: string }) => login(email, password)
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: ({ name, email, password }: { name: string, email: string, password: string }) =>
      useAuthStore.getState().register(name, email, password)
  });
};

export const useAuthCheck = () => {
  const { checkAuth } = useAuthStore();
  return useQuery({
    queryKey: ['auth', 'check'],
    queryFn: checkAuth,
    retry: false,
    refetchOnWindowFocus: false
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: () => {
      logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    }
  });
};
