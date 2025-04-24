"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ChevronDown, MoreHorizontal, Package, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cancelOrder, updateOrderStatus, type Order } from "@/lib/api/orders";
import { toast } from "@/components/ui/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { logObject } from "@/utils/debug-console";

interface OrdersTableProps {
  orders: Order[] | any;
  onRefresh: () => void;
}

export function OrdersTable({ orders, onRefresh }: OrdersTableProps) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [normalizedOrders, setNormalizedOrders] = useState<Order[]>([]);

  const debugOrderStructure = (order: any) => {
    if (!order) return;

    console.group("Order Structure Analysis");
    console.log("Order keys:", Object.keys(order));

    const possibleIdFields = ["id", "_id", "orderId", "order_id"];
    const idField = possibleIdFields.find(
      (field) => order[field] !== undefined
    );
    console.log(
      "ID field found:",
      idField,
      "Value:",
      idField ? order[idField] : "None"
    );

    const possibleItemsFields = [
      "items",
      "orderItems",
      "products",
      "lineItems",
    ];
    const itemsField = possibleItemsFields.find((field) =>
      Array.isArray(order[field])
    );
    console.log("Items field found:", itemsField);

    if (itemsField && order[itemsField].length > 0) {
      console.log("First item keys:", Object.keys(order[itemsField][0]));
    }

    const dateFields = ["createdAt", "created_at", "date", "orderDate"];
    const foundDateField = dateFields.find((field) => order[field]);
    console.log(
      "Date field found:",
      foundDateField,
      "Value:",
      foundDateField ? order[foundDateField] : "None"
    );

    const statusFields = ["status", "orderStatus", "state"];
    const statusField = statusFields.find((field) => order[field]);
    console.log(
      "Status field found:",
      statusField,
      "Value:",
      statusField ? order[statusField] : "None"
    );

    const totalFields = ["total", "totalAmount", "amount", "price"];
    const totalField = totalFields.find((field) => order[field] !== undefined);
    console.log(
      "Total field found:",
      totalField,
      "Value:",
      totalField ? order[totalField] : "None"
    );

    console.groupEnd();
  };

  useEffect(() => {
    console.log("OrdersTable received orders type:", typeof orders);

    let processedOrders: Order[] = [];

    if (Array.isArray(orders)) {
      console.log(`OrdersTable: received array of ${orders.length} orders`);

      if (orders.length > 0) {
        debugOrderStructure(orders[0]);
      }

      processedOrders = orders.map((order) => {
        return {
          id:
            order.id ||
            order._id ||
            order.orderId ||
            order.order_id ||
            "unknown",
          userId: order.userId || order.user_id || order.customerId || "",
          items: Array.isArray(order.items)
            ? order.items
            : Array.isArray(order.orderItems)
            ? order.orderItems
            : Array.isArray(order.products)
            ? order.products
            : [],
          status: order.status || order.orderStatus || order.state || "PENDING",
          total:
            typeof order.total === "number"
              ? order.total
              : typeof order.totalAmount === "number"
              ? order.totalAmount
              : typeof order.amount === "number"
              ? order.amount
              : 0,
          createdAt:
            order.createdAt ||
            order.created_at ||
            order.date ||
            order.orderDate ||
            new Date().toISOString(),
          updatedAt:
            order.updatedAt ||
            order.updated_at ||
            order.modifiedAt ||
            order.createdAt ||
            new Date().toISOString(),
        };
      });
    } else if (orders && typeof orders === "object") {
      console.warn(
        "OrdersTable: Expected array but received object, inspecting it"
      );
      logObject("OrdersTable received non-array orders", orders);

      if (Array.isArray(orders.data)) {
        processedOrders = orders.data;
      } else if (Array.isArray(orders.orders)) {
        processedOrders = orders.orders;
      } else if (orders.id || orders._id) {
        debugOrderStructure(orders);
        processedOrders = [orders];
      }
    } else {
      console.error("OrdersTable: Invalid orders prop:", orders);
    }

    const validOrders = processedOrders.filter(
      (order) => order && typeof order === "object" && (order.id || order._id)
    );

    if (validOrders.length !== processedOrders.length) {
      console.warn(
        `Filtered out ${
          processedOrders.length - validOrders.length
        } invalid orders`
      );
    }

    setNormalizedOrders(validOrders);
  }, [orders]);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleStatusUpdate = async (
    orderId: string,
    status: Order["status"]
  ) => {
    setIsUpdating(orderId);
    try {
      await updateOrderStatus(orderId, status);
      toast({
        title: "Order updated",
        description: `Order status has been updated to ${status.toLowerCase()}.`,
      });
      onRefresh();
    } catch (error) {
      console.error("Failed to update order:", error);
      toast({
        title: "Update failed",
        description:
          "There was a problem updating the order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    setIsUpdating(orderId);
    try {
      await cancelOrder(orderId);
      toast({
        title: "Order cancelled",
        description: "The order has been cancelled successfully.",
      });
      onRefresh();
    } catch (error) {
      console.error("Failed to cancel order:", error);
      toast({
        title: "Cancellation failed",
        description:
          "There was a problem cancelling the order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusBadgeVariant = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return "outline";
      case "PROCESSING":
        return "secondary";
      case "SHIPPED":
        return "default";
      case "DELIVERED":
        return "success";
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="h-8 gap-1">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(normalizedOrders) &&
              normalizedOrders.length > 0 ? (
                normalizedOrders.map((order) => {
                  // Get the ID safely
                  const orderId = order.id || order._id || "unknown";

                  // Parse the date with fallbacks
                  const orderDate =
                    order.createdAt ||
                    order.created_at ||
                    order.date ||
                    new Date().toISOString();

                  // Get items array safely
                  const orderItems = Array.isArray(order.items)
                    ? order.items
                    : Array.isArray(order.orderItems)
                    ? order.orderItems
                    : [];

                  // Get status with fallback
                  const orderStatus = order.status || "PENDING";

                  // Get total with fallback
                  const orderTotal =
                    typeof order.total === "number"
                      ? order.total
                      : typeof order.totalAmount === "number"
                      ? order.totalAmount
                      : 0;

                  return (
                    <Collapsible
                      key={orderId}
                      open={expandedOrder === orderId}
                      onOpenChange={() => {}}
                      asChild>
                      <>
                        <TableRow className="cursor-pointer hover:bg-muted/50">
                          <TableCell
                            onClick={() => toggleOrderDetails(orderId)}
                            className="font-medium">
                            #
                            {typeof orderId === "string"
                              ? orderId.substring(0, 8)
                              : orderId}
                          </TableCell>
                          <TableCell
                            onClick={() => toggleOrderDetails(orderId)}>
                            {format(new Date(orderDate), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell
                            onClick={() => toggleOrderDetails(orderId)}>
                            <Badge variant={getStatusBadgeVariant(orderStatus)}>
                              {orderStatus}
                            </Badge>
                          </TableCell>
                          <TableCell
                            onClick={() => toggleOrderDetails(orderId)}
                            className="text-right">
                            ${orderTotal.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center">
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleOrderDetails(orderId)}>
                                  <ChevronDown
                                    className={`h-4 w-4 transition-transform ${
                                      expandedOrder === orderId
                                        ? "transform rotate-180"
                                        : ""
                                    }`}
                                  />
                                  <span className="sr-only">
                                    Toggle details
                                  </span>
                                </Button>
                              </CollapsibleTrigger>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {orderStatus !== "CANCELLED" && (
                                    <>
                                      {orderStatus === "PENDING" && (
                                        <DropdownMenuItem
                                          disabled={isUpdating === orderId}
                                          onClick={() =>
                                            handleStatusUpdate(
                                              orderId,
                                              "PROCESSING"
                                            )
                                          }>
                                          Mark as Processing
                                        </DropdownMenuItem>
                                      )}
                                      {orderStatus === "PROCESSING" && (
                                        <DropdownMenuItem
                                          disabled={isUpdating === orderId}
                                          onClick={() =>
                                            handleStatusUpdate(
                                              orderId,
                                              "SHIPPED"
                                            )
                                          }>
                                          Mark as Shipped
                                        </DropdownMenuItem>
                                      )}
                                      {orderStatus === "SHIPPED" && (
                                        <DropdownMenuItem
                                          disabled={isUpdating === orderId}
                                          onClick={() =>
                                            handleStatusUpdate(
                                              orderId,
                                              "DELIVERED"
                                            )
                                          }>
                                          Mark as Delivered
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem
                                        disabled={
                                          isUpdating === orderId ||
                                          orderStatus === "DELIVERED"
                                        }
                                        onClick={() =>
                                          handleCancelOrder(orderId)
                                        }
                                        className="text-destructive focus:text-destructive">
                                        Cancel Order
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                          <TableRow>
                            <TableCell colSpan={5} className="p-0">
                              <div className="bg-muted/40 p-4">
                                <h4 className="font-medium mb-2 flex items-center">
                                  <Package className="h-4 w-4 mr-2" />
                                  Order Items
                                </h4>
                                <div className="space-y-2">
                                  {Array.isArray(orderItems) &&
                                  orderItems.length > 0 ? (
                                    orderItems.map((item, index) => {
                                      // Try to extract product name and price from various possible formats
                                      const productName =
                                        item.product?.name ||
                                        item.productName ||
                                        item.name ||
                                        `Product #${
                                          item.productId ||
                                          item.product_id ||
                                          index
                                        }`;

                                      const productQty =
                                        item.quantity ||
                                        item.qty ||
                                        item.amount ||
                                        1;

                                      const productPrice =
                                        item.price ||
                                        item.unitPrice ||
                                        item.product?.price ||
                                        0;

                                      const itemTotal =
                                        productPrice * productQty;

                                      return (
                                        <div
                                          key={index}
                                          className="flex justify-between py-1 border-b border-border last:border-0">
                                          <div>
                                            <span className="font-medium">
                                              {productName}
                                            </span>
                                            <span className="ml-2 text-sm text-muted-foreground">
                                              × {productQty}
                                            </span>
                                          </div>
                                          <div>${itemTotal.toFixed(2)}</div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div>No items found in this order</div>
                                  )}
                                  <div className="flex justify-between pt-2 font-medium">
                                    <div>Total</div>
                                    <div>${orderTotal.toFixed(2)}</div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
