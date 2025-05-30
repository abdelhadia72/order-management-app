const getToken = () => localStorage.getItem("token");
import { API_URL } from "@/lib/api/config";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  if (!token) {
    console.log("No authentication token found");
  }

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const url = `${API_URL}${
      endpoint.startsWith("/") ? endpoint : "/" + endpoint
    }`;
    console.log(`Making API request to: ${url}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get("content-type");
    console.log(
      `API response status: ${response.status}, content-type: ${contentType}`
    );

    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        try {
          const errorData = await response.json();
          console.error(`API error: ${response.status}`, errorData);
          throw new Error(errorData.message || `API error: ${response.status}`);
        } catch (e) {
          console.error(
            `API error: ${response.status} (failed to parse error response)`
          );
          throw new Error(`API error: ${response.status}`);
        }
      } else {
        const text = await response.text();
        console.error(
          "API returned non-JSON error:",
          text.substring(0, 100) + "..."
        );
        throw new Error(`API error: ${response.status}`);
      }
    }

    if (response.status === 204) {
      return {} as T;
    }

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log(
        `API data received successfully, items: ${
          Array.isArray(data) ? data.length : "object"
        }`
      );
      return data;
    } else {
      console.warn("API returned non-JSON success response");
      return {} as T;
    }
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

export function apiGet<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return apiFetch<T>(endpoint, { method: "GET", ...options });
}

export function apiPost<T>(
  endpoint: string,
  data?: any,
  options?: RequestInit
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

export function apiPut<T>(
  endpoint: string,
  data?: any,
  options?: RequestInit
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

export function apiPatch<T>(
  endpoint: string,
  data?: any,
  options?: RequestInit
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

export function apiDelete<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  return apiFetch<T>(endpoint, { method: "DELETE", ...options });
}
