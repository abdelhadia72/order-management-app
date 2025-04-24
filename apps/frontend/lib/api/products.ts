import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";
import { logObject } from "@/utils/debug-console";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductInput = {
  name: string;
  description: string;
  price: number;
  stock: number;
};

export async function fetchProducts(): Promise<Product[]> {
  console.log("Calling fetchProducts API endpoint...");
  try {
    const products = await apiGet<Product[]>("/products/admin/all");
    console.log(`API returned ${products.length} products`);

    // Add extra validation and logging for debugging
    if (products.length > 0) {
      logObject("First product returned", products[0]);

      // Check if products have expected properties
      const validProducts = products.filter(
        (p) => p && (p.id || p._id || p.productId)
      );
      if (validProducts.length < products.length) {
        console.warn(
          `Found ${
            products.length - validProducts.length
          } products with missing IDs`
        );
      }

      // Normalize product IDs if needed
      return products.map((p) => {
        if (!p.id && (p._id || p.productId)) {
          return {
            ...p,
            id: p._id || p.productId,
          };
        }
        return p;
      });
    }

    return products;
  } catch (error) {
    console.error("Error in fetchProducts:", error);
    // Re-throw to let the component handle it
    throw error;
  }
}

export async function fetchMyProducts(): Promise<Product[]> {
  console.log("Calling fetchMyProducts API endpoint...");
  try {
    const products = await apiGet<Product[]>("/products");
    console.log(`API returned ${products.length} products to fetchMyProducts`);
    return products;
  } catch (error) {
    console.error("Error in fetchMyProducts:", error);
    // Re-throw to let the component handle it
    throw error;
  }
}

export async function fetchProduct(id: string): Promise<Product> {
  return apiGet<Product>(`/products/${id}`);
}

export async function createProduct(
  data: CreateProductInput
): Promise<Product> {
  return apiPost<Product>("/products", data);
}

export async function updateProduct(
  id: string,
  data: Partial<CreateProductInput>
): Promise<Product> {
  return apiPatch<Product>(`/products/${id}`, data);
}

export async function deleteProduct(id: string): Promise<void> {
  return apiDelete<void>(`/products/${id}`);
}
