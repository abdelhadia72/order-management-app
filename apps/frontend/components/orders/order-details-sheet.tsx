"use client"

import { format } from "date-fns"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Order } from "@/lib/api/orders"

interface OrderDetailsSheetProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderDetailsSheet({ order, open, onOpenChange }: OrderDetailsSheetProps) {
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80"
      case "processing":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80"
      case "shipped":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100/80"
      case "delivered":
        return "bg-green-100 text-green-800 hover:bg-green-100/80"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100/80"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80"
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Order Details</SheetTitle>
          <SheetDescription>
            Order #{order.id.substring(0, 8)} - Created on {format(new Date(order.createdAt), "MMMM dd, yyyy")}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <Badge variant="outline" className={getStatusColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-medium text-muted-foreground">Total Amount</h3>
              <p className="text-lg font-semibold">${order.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 font-medium">Products</h3>
            <div className="space-y-4">
              {order.products.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Order Information</h3>
            <div className="mt-3 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Order ID</span>
                <span className="text-sm font-mono text-xs">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">User ID</span>
                <span className="text-sm font-mono text-xs">{order.userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Created</span>
                <span className="text-sm">{format(new Date(order.createdAt), "PPP")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Last Updated</span>
                <span className="text-sm">{format(new Date(order.updatedAt), "PPP")}</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
