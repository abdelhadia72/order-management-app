"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { DashboardShell } from "@/components/shell";
import { DashboardHeader } from "@/components/header";
import { Button } from "@/components/ui/button";
import { OrdersTable } from "@/components/orders/orders-table";
import { CreateOrderDialog } from "@/components/orders/create-order-dialog";
import { fetchOrders, type Order } from "@/lib/api/orders";
import { toast } from "@/components/ui/use-toast";
import { Loader } from "@/components/ui/loader";
import { logObject } from "@/utils/debug-console";

export default function OrdersPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [ordersData, setOrdersData] = useState<Order[]>([]);

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      try {
        console.log("Fetching orders from React Query...");
        const data = await fetchOrders();
        console.log(`React Query received orders:`, typeof data);

        if (!Array.isArray(data)) {
          console.warn("fetchOrders did not return an array:");
          logObject("Non-array orders data", data);

          // Try to normalize the data
          if (data && typeof data === "object") {
            if (Array.isArray(data.data)) return data.data;
            if (Array.isArray(data.orders)) return data.orders;
            if (data.id) return [data]; // Single order
          }

          // Return empty array as fallback
          return [] as Order[];
        }

        return data;
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        toast({
          title: "Error fetching orders",
          description: "Failed to load your orders. Please try again.",
          variant: "destructive",
        });
        return [] as Order[]; // Return empty array instead of throwing
      }
    },
  });

  // Make sure we always have an array of orders
  useEffect(() => {
    if (Array.isArray(orders)) {
      setOrdersData(orders);
    } else if (orders && typeof orders === "object") {
      console.warn("Orders page received non-array data");
      logObject("Non-array orders data in useEffect", orders);

      // Try to extract orders from various structures
      if (Array.isArray((orders as any).data)) {
        setOrdersData((orders as any).data);
      } else if (Array.isArray((orders as any).orders)) {
        setOrdersData((orders as any).orders);
      } else if ((orders as any).id) {
        setOrdersData([orders as any]);
      } else {
        setOrdersData([]);
      }
    } else {
      setOrdersData([]);
    }
  }, [orders]);

  const handleCreateSuccess = () => {
    refetch();
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Orders"
        description="View and manage your orders.">
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </DashboardHeader>

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Loader className="h-6 w-6" />
          <span className="ml-2">Loading orders...</span>
        </div>
      ) : isError ? (
        <div className="flex justify-center items-center p-8 text-red-500">
          <p>
            Error loading orders:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Button variant="outline" className="ml-4" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <OrdersTable orders={ordersData} onRefresh={refetch} />
      )}

      <CreateOrderDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </DashboardShell>
  );
}
