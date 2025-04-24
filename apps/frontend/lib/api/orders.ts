import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";
import { logObject } from "@/utils/debug-console";

// More flexible types to accommodate different API responses
export type OrderItem = {
  id?: string;
  productId?: number | string;
  product_id?: number | string;
  quantity?: number;
  qty?: number;
  price?: number;
  unitPrice?: number;
  product?: {
    id?: string;
    _id?: string;
    name?: string;
    price?: number;
  };
  name?: string; // Some APIs include the product name directly in the line item
  productName?: string;
};

export type Order = {
  id?: string;
  _id?: string;
  orderId?: string;
  order_id?: string;
  userId?: string;
  user_id?: string;
  customerId?: string;
  items?: OrderItem[];
  orderItems?: OrderItem[];
  products?: OrderItem[];
  lineItems?: OrderItem[];
  status?:
    | "PENDING"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | string;
  orderStatus?: string;
  state?: string;
  total?: number;
  totalAmount?: number;
  amount?: number;
  price?: number;
  createdAt?: string;
  created_at?: string;
  date?: string;
  orderDate?: string;
  updatedAt?: string;
  updated_at?: string;
  modifiedAt?: string;
};

export type CreateOrderInput = {
  items: {
    productId: number;
    quantity: number;
  }[];
};

/**
 * Fetch all orders for the current user
 */
export async function fetchOrders(): Promise<Order[]> {
  console.log("Fetching orders...");
  try {
    const response = await apiGet<any>("/orders");

    // Debug what we received from the API
    console.log("Orders API response type:", typeof response);
    logObject("Raw orders API response", response);

    // Handle various response formats
    let orders: Order[] = [];

    if (Array.isArray(response)) {
      console.log(`Received an array of ${response.length} orders`);
      orders = response;
    } else if (response && typeof response === "object") {
      // Some APIs wrap the data in a data property
      if (Array.isArray(response.data)) {
        console.log(
          `Received ${response.data.length} orders in a data property`
        );
        orders = response.data;
      } else if (response.orders && Array.isArray(response.orders)) {
        console.log(
          `Received ${response.orders.length} orders in an orders property`
        );
        orders = response.orders;
      } else {
        // If it's a single order object, wrap it in an array
        if (response.id || response._id || response.orderId) {
          console.log("Received a single order object, converting to array");
          orders = [response];
        } else {
          console.warn("Unexpected response format from orders API:", response);
          orders = [];
        }
      }
    } else {
      console.warn("Invalid response format from orders API:", response);
      orders = [];
    }

    // Debug the final processed orders
    console.log(`Processed ${orders.length} orders`);
    if (orders.length > 0) {
      logObject("First order", orders[0]);
      console.log("First order keys:", Object.keys(orders[0]));

      if (Array.isArray(orders[0].items) && orders[0].items.length > 0) {
        console.log("Order item keys:", Object.keys(orders[0].items[0]));
      } else if (
        Array.isArray(orders[0].orderItems) &&
        orders[0].orderItems.length > 0
      ) {
        console.log(
          "Order item keys (orderItems):",
          Object.keys(orders[0].orderItems[0])
        );
      }
    }

    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    // Return empty array on error to avoid breaking the UI
    return [];
  }
}

/**
 * Fetch a single order by ID
 */
export async function fetchOrder(id: string): Promise<Order> {
  return apiGet<Order>(`/orders/${id}`);
}

/**
 * Create a new order
 */
export async function createOrder(data: CreateOrderInput): Promise<Order> {
  console.log("Creating order with data:", data);
  return apiPost<Order>("/orders", data);
}

/**
 * Update an order's status
 */
export async function updateOrderStatus(
  id: string,
  status: Order["status"]
): Promise<Order> {
  return apiPatch<Order>(`/orders/${id}`, { status });
}

/**
 * Cancel an order
 */
export async function cancelOrder(id: string): Promise<Order> {
  return apiPatch<Order>(`/orders/${id}`, { status: "CANCELLED" });
}
