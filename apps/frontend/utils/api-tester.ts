/**
 * Utility to test API endpoints
 *
 * Use this in your browser console or in a component temporarily to test API connectivity
 */

import {
  fetchProducts,
  fetchMyProducts,
  fetchProduct,
} from "@/lib/api/products";

export async function testProductsApi() {
  console.group("API Testing Utility");

  try {
    console.log("Testing fetchProducts...");
    const allProducts = await fetchProducts();
    console.log("All products:", allProducts);

    console.log("\nTesting fetchMyProducts...");
    const myProducts = await fetchMyProducts();
    console.log("My products:", myProducts);

    if (allProducts.length > 0) {
      console.log("\nTesting fetchProduct with first product id...");
      const product = await fetchProduct(allProducts[0].id);
      console.log("Single product:", product);
    }

    console.log("\nAPI tests completed successfully!");
  } catch (error) {
    console.error("API test failed:", error);
  }

  console.groupEnd();
  return "API tests completed";
}

// You can run this in your browser console with:
// import { testProductsApi } from '@/utils/api-tester'; testProductsApi();
